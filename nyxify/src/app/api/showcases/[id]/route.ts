import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteShowcaseMessage, editShowcaseMessage } from "@/lib/discord-bridge";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.showcase.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const showcase = await prisma.showcase.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      category: body.category ?? existing.category,
      images: body.images ?? existing.images
    }
  });

  // Keep the live Discord post in sync with the edit rather than leaving it
  // stale — same title/description/image the site now shows.
  if (showcase.discordMessageId) {
    await editShowcaseMessage({
      messageId: showcase.discordMessageId,
      channelId: showcase.discordChannelId,
      title: showcase.title,
      description: showcase.description,
      imageUrl: showcase.images[0] ?? "",
      showcaseUrl: `${process.env.NEXTAUTH_URL}/portfolio/${showcase.id}`
    });
  }

  return NextResponse.json(showcase);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const showcase = await prisma.showcase.findUnique({ where: { id: params.id } });
  if (!showcase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (showcase.discordMessageId) {
    await deleteShowcaseMessage(showcase.discordMessageId, showcase.discordChannelId);
  }

  await prisma.showcase.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
