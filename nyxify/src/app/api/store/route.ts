import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.storeItem.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const item = await prisma.storeItem.create({
    data: {
      title: body.title,
      description: body.description,
      priceCents: Math.round(Number(body.price) * 100),
      image: body.image,
      category: body.category
    }
  });

  return NextResponse.json(item, { status: 201 });
}
