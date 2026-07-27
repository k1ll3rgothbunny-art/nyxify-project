/**
 * All Discord actions (opening ticket channels, posting to the portfolio
 * channel, DMing customers) are plain outbound REST calls to Discord's API.
 * DISCORD_BOT_TOKEN is only ever read here, server-side.
 */
const API = "https://discord.com/api/v10";
const TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";
const GUILD_ID = process.env.DISCORD_GUILD_ID ?? "";
const TICKET_CATEGORY_ID = process.env.DISCORD_TICKET_CATEGORY_ID;
const PORTFOLIO_CHANNEL_ID = process.env.DISCORD_PORTFOLIO_CHANNEL_ID ?? "";
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID;

const BRAND_COLOR = 0xff96d4;
const PERM_VIEW_CHANNEL = "1024";
const PERM_SEND_MESSAGES = "2048";

async function discordFetch(path: string, init?: RequestInit) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: "Bot " + TOKEN,
      "Content-Type": "application/json",
      ...(init && init.headers ? init.headers : {})
    }
  });
  if (!res.ok) {
    console.error("Discord API " + path + " failed: " + res.status + " " + (await res.text()));
    return null;
  }
  return res.status === 204 ? {} : res.json();
}

export async function openOrderTicket(opts: { discordId: string; orderId: string; service: string; referenceNote?: string; referenceImageUrls?: string[] }) {
  const permissionOverwrites = [
    { id: GUILD_ID, type: 0, deny: PERM_VIEW_CHANNEL },
    { id: opts.discordId, type: 1, allow: PERM_VIEW_CHANNEL }
  ];
  if (STAFF_ROLE_ID) permissionOverwrites.push({ id: STAFF_ROLE_ID, type: 0, allow: PERM_VIEW_CHANNEL });

  const channel = await discordFetch("/guilds/" + GUILD_ID + "/channels", {
    method: "POST",
    body: JSON.stringify({
      name: "order-" + opts.orderId.slice(-6),
      type: 0,
      parent_id: TICKET_CATEGORY_ID,
      permission_overwrites: permissionOverwrites
    })
  });
  if (!channel) return null;

  const referenceEmbeds: any[] = (opts.referenceImageUrls || []).slice(0, 9).map(function (url) {
    return { image: { url }, color: BRAND_COLOR };
  });

  const mainEmbed = {
    title: "New order — " + opts.service,
    description: opts.referenceNote || "No notes provided.",
    fields: [{ name: "Order ID", value: opts.orderId }],
    color: BRAND_COLOR
  };

  await discordFetch("/channels/" + channel.id + "/messages", {
    method: "POST",
    body: JSON.stringify({
      content: "<@" + opts.discordId + "> welcome! I'll send your quote here.",
      embeds: [mainEmbed].concat(referenceEmbeds)
    })
  });

  return { channelId: channel.id, channelUrl: "https://discord.com/channels/" + GUILD_ID + "/" + channel.id };
}

export function notifyTicketPaid(opts: { channelId: string; orderId: string }) {
  return discordFetch("/channels/" + opts.channelId + "/messages", {
    method: "POST",
    body: JSON.stringify({
      embeds: [{ title: "Payment received ✅", description: "Order `" + opts.orderId + "` is now In Progress.", color: BRAND_COLOR }]
    })
  });
}

export async function closeOrderTicket(channelId: string, customerDiscordId: string) {
  await discordFetch("/channels/" + channelId + "/messages", {
    method: "POST",
    body: JSON.stringify({
      embeds: [{ title: "Order completed ✅", description: "This ticket is now closed. Thanks for your order!", color: BRAND_COLOR }]
    })
  });

  await discordFetch("/channels/" + channelId + "/permissions/" + customerDiscordId, {
    method: "PUT",
    body: JSON.stringify({ type: 1, allow: PERM_VIEW_CHANNEL, deny: PERM_SEND_MESSAGES })
  });

  await discordFetch("/channels/" + channelId, {
    method: "PATCH",
    body: JSON.stringify({ name: "closed-" + channelId.slice(-4) })
  });
}

export async function postShowcaseToDiscord(opts: { title: string; description: string; imageUrl: string; showcaseUrl: string }) {
  const message = await discordFetch("/channels/" + PORTFOLIO_CHANNEL_ID + "/messages", {
    method: "POST",
    body: JSON.stringify({
      embeds: [
        {
          title: opts.title,
          description: opts.description,
          url: opts.showcaseUrl,
          image: opts.imageUrl ? { url: opts.imageUrl } : undefined,
          color: BRAND_COLOR
        }
      ]
    })
  });
  return message;
}

export function deleteShowcaseMessage(messageId: string) {
  return discordFetch("/channels/" + PORTFOLIO_CHANNEL_ID + "/messages/" + messageId, { method: "DELETE" });
}

export async function dmStatusUpdate(opts: { discordId: string; orderId: string; status: string; message: string }) {
  const dm = await discordFetch("/users/@me/channels", {
    method: "POST",
    body: JSON.stringify({ recipient_id: opts.discordId })
  });
  if (!dm) return null;

  return discordFetch("/channels/" + dm.id + "/messages", {
    method: "POST",
    body: JSON.stringify({
      embeds: [
        {
          title: "Order update",
          description: opts.message,
          fields: [
            { name: "Order", value: opts.orderId },
            { name: "Status", value: opts.status }
          ],
          color: BRAND_COLOR
        }
      ]
    })
  });
}

const QUEUE_STATUS_WORDS: Record<string, string> = {
  AWAITING_QUOTE: "awaiting quote",
  AWAITING_PAYMENT: "awaiting payment",
  PAID: "paid",
  IN_PROGRESS: "in progress",
  WAITING_ON_CUSTOMER: "waiting",
  REVISION_REQUESTED: "revision requested"
};
const SERVICE_LABELS: Record<string, string> = {
  CLOTHING: "Clothing",
  CHAINS: "Chain",
  FACES: "Face",
  TATTOOS: "Tattoo",
  OTHER: "Custom"
};

export async function refreshOrderQueue() {
  const channelId = process.env.DISCORD_QUEUE_CHANNEL_ID;
  if (!channelId) return;

  const { prisma } = await import("./prisma");

  // Completed and archived orders drop off the board entirely once done —
  // this is a live worklist of what's still in flight, not a history log.
  const orders = await prisma.order.findMany({
    where: { status: { in: Object.keys(QUEUE_STATUS_WORDS) as any } },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 25
  });

  const chronological = orders.slice().reverse();

  const lines = chronological.map(function (o) {
    const label = SERVICE_LABELS[o.service] || o.service;
    return "- " + label + " ~ " + o.customer.username + " ~ " + (QUEUE_STATUS_WORDS[o.status] || o.status);
  });

  const siteUrl = process.env.NEXTAUTH_URL || "";

  const embed = {
    title: "♡ **__Nyxify's Que__** ♡",
    description: lines.length === 0 ? "No active orders right now." : lines.join("\n"),
    color: BRAND_COLOR,
    thumbnail: siteUrl ? { url: siteUrl + "/images/favicon.png" } : undefined,
    image: siteUrl ? { url: siteUrl + "/images/banner.jpg" } : undefined,
    footer: { text: "Live — updates automatically" },
    timestamp: new Date().toISOString()
  };

  const existing = await prisma.discordQueueMessage.findUnique({ where: { id: "singleton" } });

  if (existing && existing.messageId) {
    const edited = await discordFetch("/channels/" + channelId + "/messages/" + existing.messageId, {
      method: "PATCH",
      body: JSON.stringify({ embeds: [embed] })
    });
    if (edited) return;
  }

  const created = await discordFetch("/channels/" + channelId + "/messages", {
    method: "POST",
    body: JSON.stringify({ embeds: [embed] })
  });
  if (created) {
    await prisma.discordQueueMessage.upsert({
      where: { id: "singleton" },
      update: { messageId: created.id },
      create: { id: "singleton", messageId: created.id }
    });
  }
}
