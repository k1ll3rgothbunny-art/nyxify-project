import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { orderId, rating, body: reviewBody, screenshots } = await req.json();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only review completed orders" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      customerId: userId,
      rating,
      body: reviewBody,
      screenshots: screenshots ?? []
    }
  });

  return NextResponse.json(review, { status: 201 });
}
