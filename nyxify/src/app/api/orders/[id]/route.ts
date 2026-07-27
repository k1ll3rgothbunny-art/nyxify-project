import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dmStatusUpdate, refreshOrderQueue, closeOrderTicket } from "@/lib/discord-bridge";

const STATUS_MESSAGES: Record<string, string> = {
  AWAITING_PAYMENT: "Your quote is ready — head to your dashboard to pay.",
  PAID: "Payment received! Your order is queued up.",
  IN_PROGRESS: "Work has started on your order.",
  WAITING_ON_CUSTOMER: "I need a bit more info from you to keep going.",
  REVISION_REQUESTED: "Revisions are underway.",
  COMPLETED: "Your order is complete and the files are in your Vault.",
  ARCHIVED: "This order has been archived."
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { referenceFiles: true, payments: true, customer: true }
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  if (order.customerId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

// Admin-only: update status, quote, etc. Also fires the customer notification.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: body.status ?? undefined,
      quoteCents: body.quoteCents ?? undefined,
      depositCents: body.depositCents ?? undefined
    },
    include: { customer: true }
  });

  if (body.status) {
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        type: body.status.toLowerCase(),
        message: STATUS_MESSAGES[body.status] ?? `Order status updated to ${body.status}.`
      }
    });
    await dmStatusUpdate({
      discordId: order.customer.discordId,
      orderId: order.id,
      status: body.status,
      message: STATUS_MESSAGES[body.status] ?? `Order status updated to ${body.status}.`
    });
    await refreshOrderQueue();

    if (body.status === "COMPLETED" && order.discordTicketChannelId) {
      await closeOrderTicket(order.discordTicketChannelId, order.customer.discordId);
    }
  }

  return NextResponse.json(order);
}
