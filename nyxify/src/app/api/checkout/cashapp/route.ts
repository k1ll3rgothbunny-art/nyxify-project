import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSquarePayment } from "@/lib/square";
import { markOrderPaid, applyCoupon } from "@/lib/order-payment";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, sourceId, payDeposit, couponCode } = await req.json();
  const userId = (session.user as any).id as string;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!order.quoteCents) {
    return NextResponse.json({ error: "This order doesn't have a quote yet" }, { status: 400 });
  }

  const baseAmount = payDeposit && order.depositCents ? order.depositCents : order.quoteCents;
  const amountCents = await applyCoupon(baseAmount, couponCode);

  const payment = await createSquarePayment({ sourceId, amountCents, orderId: order.id });
  if (payment.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment was not completed" }, { status: 400 });
  }

  await markOrderPaid({
    orderId: order.id,
    amountCents,
    method: "CASHAPP",
    providerRef: payment.id,
    isDeposit: !!payDeposit
  });

  return NextResponse.json({ ok: true });
}
