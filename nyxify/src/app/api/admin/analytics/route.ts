import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [revenueAgg, ordersThisMonth, pendingPayments, totalCustomers, serviceCounts, avgOrderAgg] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amountCents: true }, where: { status: "succeeded" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { status: "AWAITING_PAYMENT" } }),
    prisma.user.count(),
    prisma.order.groupBy({ by: ["service"], _count: { service: true } }),
    prisma.payment.aggregate({ _avg: { amountCents: true }, where: { status: "succeeded" } })
  ]);

  const returningCustomers = await prisma.user.count({
    where: { orders: { some: {} } }
  });

  return NextResponse.json({
    revenueCents: revenueAgg._sum.amountCents ?? 0,
    ordersThisMonth,
    pendingPayments,
    totalCustomers,
    returningCustomers,
    averageOrderValueCents: Math.round(avgOrderAgg._avg.amountCents ?? 0),
    bestSellingServices: serviceCounts
      .map((s) => ({ service: s.service, count: s._count.service }))
      .sort((a, b) => b.count - a.count)
  });
}
