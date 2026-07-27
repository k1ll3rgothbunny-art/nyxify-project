import { prisma } from "./prisma";
import { notifyTicketPaid, dmStatusUpdate } from "./discord-bridge";

// Both PayPal (capture) and Cash App Pay (Square) hit this once money is
// actually confirmed. Keeping it in one place means the order-status,
// payment-record, and Discord-notification logic can't drift apart between
// the two payment methods.
export async function markOrderPaid(opts: {
  orderId: string;
  amountCents: number;
  method: "PAYPAL" | "CASHAPP";
  providerRef: string;
  isDeposit?: boolean;
}) {
  const order = await prisma.order.update({
    where: { id: opts.orderId },
    data: {
      status: "PAID",
      totalPaidCents: { increment: opts.amountCents }
    },
    include: { customer: true }
  });

  await prisma.payment.create({
    data: {
      orderId: opts.orderId,
      method: opts.method,
      amountCents: opts.amountCents,
      isDeposit: !!opts.isDeposit,
      providerRef: opts.providerRef,
      status: "succeeded"
    }
  });

  await prisma.user.update({
    where: { id: order.customerId },
    data: { totalSpentCents: { increment: opts.amountCents } }
  });

  await prisma.notification.create({
    data: { userId: order.customerId, type: "payment_received", message: "Payment received — your order is moving to In Progress." }
  });

  if (order.discordTicketChannelId) {
    await notifyTicketPaid({ channelId: order.discordTicketChannelId, orderId: order.id });
  }
  await dmStatusUpdate({
    discordId: order.customer.discordId,
    orderId: order.id,
    status: "PAID",
    message: "Payment received — your order is moving to In Progress."
  });

  return order;
}

// Applies a coupon code to a base amount, if it's valid and active.
export async function applyCoupon(amountCents: number, couponCode?: string) {
  if (!couponCode) return amountCents;
  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!coupon?.active) return amountCents;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return amountCents;

  let amount = amountCents;
  if (coupon.percentOff) amount = Math.round(amount * (1 - coupon.percentOff / 100));
  if (coupon.amountOffCents) amount = Math.max(0, amount - coupon.amountOffCents);
  return amount;
}
