/**
 * All Discord actions (opening ticket channels, posting to the portfolio
 * channel, DMing customers) are plain outbound REST calls to Discord's API —
 * none of them require a persistent gateway/websocket connection. So instead
 * of running a separate always-on bot process, we just call the Discord API
 * directly from these Next.js API routes using the bot token as a server-only
 * env var. This means the whole app deploys as a single Vercel project with
 * no second server to host or pay for.
 *
 * DISCORD_BOT_TOKEN is only ever read here, server-side — it's never sent to
 * the browser.
 */
const API = "https://discord.com/api/v10";
const TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";
const GUILD_ID = process.env.DISCORD_GUILD_ID ?? "";
const TICKET_CATEGORY_ID = process.env.DISCORD_TICKET_CATEGORY_ID;
const PORTFOLIO_CHANNEL_ID = process.env.DISCORD_PORTFOLIO_CHANNEL_ID ?? "";
const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID;

async function discordFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  if (!res.ok) {
    console.error(`Discord API ${path} failed: ${res.status} ${await res.text()}`);
    return null;
  }
  return res.status === 204 ? {} : res.json();
}

export async function openOrderTicket(opts: { discordId: string; orderId: string; service: string; referenceNote?: string }) {
  const permissionOverwrites = [
    { id: GUILD_ID, type: 0, deny: "1024" },
    { id: opts.discordId, type: 1, allow: "1024" },
    ...(STAFF_ROLE_ID ? [{ id: STAFF_ROLE_ID, type: 0, allow: "1024" }] : [])
  ];

  const channel = await discordFetch(`/guilds/${GUILD_ID}/channels`, {
    method: "POST",
    body: JSON.stringify({
      name: `order-${opts.orderId.slice(-6)}`,
      type: 0,
      parent_id: TICKET_CATEGORY_ID,
      permission_overwrites: permissionOverwrites
    })
  });
  if (!channel) return null;

  await discordFetch(`/channels/${channel.id}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: `<@${opts.discordId}> welcome! I'll send your quote here.`,
      embeds: [
        {
          title: `New order — ${opts.service}`,
          description: opts.referenceNote || "No notes provided.",
          fields: [{ name: "Order ID", value: opts.orderId }],
          color: 0xff2d95
        }
      ]
    })
  });

  return { channelId: channel.id as string, channelUrl: `https://discord.com/channels/${GUILD_ID}/${channel.id}` };
}

export function notifyTicketPaid(opts: { channelId: string; orderId: string }) {
  return discordFetch(`/channels/${opts.channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      embeds: [{ title: "Payment received ✅", description: `Order \`${opts.orderId}\` is now In Progress.`, color: 0x22c55e }]
    })
  });
}

export function postShowcaseToDiscord(opts: { title: string; description: string; imageUrl: string; showcaseUrl: string }) {
  return discordFetch(`/channels/${PORTFOLIO_CHANNEL_ID}/messages`, {
    method: "POST",
    body: JSON.stringify({
      embeds: [
        {
          title: opts.title,
          description: opts.description,
          url: opts.showcaseUrl,
          image: opts.imageUrl ? { url: opts.imageUrl } : undefined,
          color: 0xff2d95
        }
      ]
    })
  });
}

export async function dmStatusUpdate(opts: { discordId: string; orderId: string; status: string; message: string }) {
  const dm = await discordFetch(`/users/@me/channels`, {
    method: "POST",
    body: JSON.stringify({ recipient_id: opts.discordId })
  });
  if (!dm) return null;

  return discordFetch(`/channels/${dm.id}/messages`, {
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
          color: 0x7c3aed
        }
      ]
    })
  });
}
