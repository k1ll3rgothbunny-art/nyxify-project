import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Registers the /deliver slash command for your server. This only needs to
// be run once (or again if you ever change the command's shape) — Discord
// remembers registered commands, it's not something that has to happen on
// every deploy.
export async function POST() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const appId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  const res = await fetch(`https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      {
        name: "deliver",
        description: "Deliver a completed file to this order's customer Vault",
        options: [
          {
            name: "file",
            description: "The completed file to deliver",
            type: 11, // ATTACHMENT
            required: true
          }
        ]
      }
    ])
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Discord rejected the command: ${text}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
