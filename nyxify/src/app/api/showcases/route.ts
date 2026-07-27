import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postShowcaseToDiscord } from "@/lib/discord-bridge";

export async function GET() {
  const showcases = await prisma.showcase.findMany({ orderBy: { completedAt: "desc" } });
  return NextResponse.json(showcases);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const showcase = await prisma.showcase.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      images: body.images ?? [],
      completedAt: new Date(body.completedAt ?? Date.now())
    }
  });

  const posted = await postShowcaseToDiscord({
    title: showcase.title,
    description: showcase.description,
    imageUrl: showcase.images[0] ?? "",
    showcaseUrl: `${process.env.NEXTAUTH_URL}/portfolio/${showcase.id}`,
    category: showcase.category
  });

  if (posted?.id) {
    await prisma.showcase.update({
      where: { id: showcase.id },
      data: { discordPosted: true, discordMessageId: posted.id, discordChannelId: posted.channelId }
    });
  }

  return NextResponse.json(showcase, { status: 201 });
}
