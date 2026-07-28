import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  return session && role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.storeItem.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const item = await prisma.storeItem.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      category: body.category ?? existing.category,
      image: body.image ?? existing.image,
      priceMinCents: body.priceMin !== undefined ? Math.round(Number(body.priceMin) * 100) : existing.priceMinCents,
      priceMaxCents:
        body.priceMax !== undefined
          ? (body.priceMax === "" || body.priceMax === null ? null : Math.round(Number(body.priceMax) * 100))
          : existing.priceMaxCents
    }
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const item = await prisma.storeItem.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.storeItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
