import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteShowcaseMessage } from "@/lib/discord-bridge";

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
