import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openOrderTicket, refreshOrderQueue } from "@/lib/discord-bridge";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referenceNote, showcaseId, category, referenceImageUrl } = await req.json();
  const userId = (session.user as any).id as string;
  const discordId = (session.user as any).discordId as string;
  const service = category || "OTHER";

  const order = await prisma.order.create({
    data: {
      customerId: userId,
      service,
      notes: referenceNote,
      status: "AWAITING_QUOTE"
    }
  });

  const ticket = await openOrderTicket({
    discordId,
    orderId: order.id,
    service,
    referenceNote: showcaseId ? `${referenceNote} (ref showcase: ${showcaseId})` : referenceNote,
    referenceImageUrls: referenceImageUrl ? [referenceImageUrl] : undefined
  });

  if (ticket?.channelId) {
    await prisma.order.update({ where: { id: order.id }, data: { discordTicketChannelId: ticket.channelId } });
  }

  await refreshOrderQueue();

  return NextResponse.json({ orderId: order.id, channelUrl: ticket?.channelUrl ?? null });
}
