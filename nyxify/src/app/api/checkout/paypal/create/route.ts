import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { applyCoupon } from "@/lib/order-payment";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, payDeposit, couponCode } = await req.json();
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

  const paypalOrder = await createPayPalOrder(amountCents, order.id);
  return NextResponse.json({ paypalOrderId: paypalOrder.id, amountCents });
}
