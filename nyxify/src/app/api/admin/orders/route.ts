import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, payments: true }
  });
  return NextResponse.json(orders);
}

// For orders placed off-site (e.g. someone who paid in Discord before the
// site existed) — lets an admin create a record manually.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const order = await prisma.order.create({
    data: {
      customerId: body.customerId,
      service: body.service,
      notes: body.notes ?? "",
      status: body.status ?? "AWAITING_QUOTE",
      quoteCents: body.quoteCents ?? null
    }
  });
  return NextResponse.json(order, { status: 201 });
}
