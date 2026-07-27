import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";
import { markOrderPaid } from "@/lib/order-payment";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, paypalOrderId, amountCents, payDeposit } = await req.json();
  const userId = (session.user as any).id as string;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment was not completed" }, { status: 400 });
  }

  await markOrderPaid({
    orderId: order.id,
    amountCents,
    method: "PAYPAL",
    providerRef: paypalOrderId,
    isDeposit: !!payDeposit
  });

  return NextResponse.json({ ok: true });
}
