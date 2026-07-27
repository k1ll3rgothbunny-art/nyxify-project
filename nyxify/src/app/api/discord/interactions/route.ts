import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";
import { prisma } from "@/lib/prisma";
import { putObject } from "@/lib/s3";
import { dmStatusUpdate, refreshOrderQueue, closeOrderTicket } from "@/lib/discord-bridge";
import { randomUUID } from "crypto";

/**
 * This is Discord's "Interactions Endpoint URL" — set it in the Discord
 * Developer Portal (General Information page) to:
 *   https://your-domain.vercel.app/api/discord/interactions
 * Discord POSTs here whenever someone runs a slash command. Every request
 * must be verified with your bot's public key, or Discord will reject the
 * endpoint entirely — that's what the signature check below does.
 */

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY ?? "";

function verifySignature(rawBody: string, signature: string | null, timestamp: string | null) {
  if (!signature || !timestamp) return false;
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!verifySignature(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 });
  }

  const interaction = JSON.parse(rawBody);

  // Discord's handshake check — required for the endpoint to be accepted at all.
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Slash command invocation
  if (interaction.type === 2 && interaction.data?.name === "deliver") {
    return handleDeliverCommand(interaction);
  }

  return NextResponse.json({ type: 4, data: { content: "Unknown command." } });
}

async function handleDeliverCommand(interaction: any) {
  const channelId = interaction.channel_id as string;

  const order = await prisma.order.findFirst({
    where: { discordTicketChannelId: channelId },
    include: { customer: true }
  });

  if (!order) {
    return NextResponse.json({
      type: 4,
      data: { content: "⚠️ I couldn't find an order linked to this channel — /deliver only works inside an order ticket channel.", flags: 64 }
    });
  }

  // The attachment option gives us an attachment ID; the actual file details
  // live in interaction.data.resolved.attachments, keyed by that ID.
  const attachmentOption = interaction.data.options?.find((o: any) => o.name === "file");
  const attachment = interaction.data.resolved?.attachments?.[attachmentOption?.value];

  if (!attachment) {
    return NextResponse.json({ type: 4, data: { content: "⚠️ No file was attached.", flags: 64 } });
  }

  try {
    const fileRes = await fetch(attachment.url);
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    const key = `deliveries/${order.id}/${randomUUID()}-${attachment.filename}`;
    await putObject(key, buffer, attachment.content_type || "application/octet-stream");

    const isImage = (attachment.content_type || "").startsWith("image/");

    await prisma.vaultItem.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        fileUrl: key,
        fileName: attachment.filename,
        fileType: attachment.content_type || "unknown",
        // The preview thumbnail can safely use Discord's CDN URL directly —
        // it's just for display in the Vault grid, not the actual download.
        previewUrl: isImage ? attachment.url : null
      }
    });

    await prisma.order.update({ where: { id: order.id }, data: { status: "COMPLETED" } });
    await prisma.notification.create({
      data: { userId: order.customerId, type: "files_delivered", message: "Your files are ready in your Vault." }
    });
    await dmStatusUpdate({
      discordId: order.customer.discordId,
      orderId: order.id,
      status: "COMPLETED",
      message: "Your files are ready in your Vault."
    });
    await refreshOrderQueue();

    if (order.discordTicketChannelId) {
      await closeOrderTicket(order.discordTicketChannelId, order.customer.discordId);
    }

    return NextResponse.json({
      type: 4,
      data: { content: `✅ Delivered **${attachment.filename}** to <@${order.customer.discordId}>'s Vault. Order marked Completed.` }
    });
  } catch (err) {
    console.error("Delivery failed:", err);
    return NextResponse.json({ type: 4, data: { content: "❌ Something went wrong delivering that file — check Vercel logs.", flags: 64 } });
  }
}
