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

  const referenceEmbeds = (opts.referenceImageUrls || []).slice(0, 9).map(function (url) {
    return { image: { url }, color: BRAND_COLOR };
  });

  await discordFetch("/channels/" + channel.id + "/messages", {
    method: "POST",
    body: JSON.stringify({
      content: "<@" + opts.discordId + "> welcome! I'll send your quote here.",
      embeds: [
        {
          title: "New order — " + opts.service,
          description: opts.referenceNote || "No notes provided.",
          fields: [{ name: "Order ID", value: opts.orderId }],
          color: BRAND_COLOR
        }
      ].concat(referenceEmbeds)
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

const QUEUE_STATUS_ORDER = ["AWAITING_QUOTE", "AWAITING_PAYMENT", "PAID", "IN_PROGRESS", "WAITING_ON_CUSTOMER", "REVISION_REQUESTED"];
const QUEUE_STATUS_LABELS: Record<string, string> = {
  AWAITING_QUOTE: "📝 Awaiting Quote",
  AWAITING_PAYMENT: "💳 Awaiting Payment",
  PAID: "✅ Paid",
  IN_PROGRESS: "🔨 In Progress",
  WAITING_ON_CUSTOMER: "⏳ Waiting on You",
  REVISION_REQUESTED: "✏️ Revision Requested"
};

export async function refreshOrderQueue() {
  const channelId = process.env.DISCORD_QUEUE_CHANNEL_ID;
  if (!channelId) return;

  const { prisma } = await import("./prisma");

  const orders = await prisma.order.findMany({
    where: { status: { in: QUEUE_STATUS_ORDER as any } },
    include: { customer: true },
    take: 25
  });

  const sorted = orders.sort(function (a, b) {
    return QUEUE_STATUS_ORDER.indexOf(a.status) - QUEUE_STATUS_ORDER.indexOf(b.status) || a.createdAt.getTime() - b.createdAt.getTime();
  });

  const embed = {
    title: "📋 Order Queue",
    description: sorted.length === 0 ? "No active orders right now." : undefined,
    fields: sorted.map(function (o) {
      return {
        name: "#" + o.id.slice(-6) + " — " + o.service,
        value: o.customer.username + " · " + (QUEUE_STATUS_LABELS[o.status] || o.status),
        inline: false
      };
    }),
    color: BRAND_COLOR,
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
