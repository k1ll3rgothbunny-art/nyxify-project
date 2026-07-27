import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedUploadUrl } from "@/lib/s3";
import { dmStatusUpdate, refreshOrderQueue, closeOrderTicket } from "@/lib/discord-bridge";
import { randomUUID } from "crypto";

// Delivers completed files: uploads to private storage, drops them into the
// customer's Vault, and flips the order to COMPLETED — all in one admin action.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { customer: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { files } = (await req.json()) as {
    files: { fileName: string; fileType: string; previewUrl?: string }[];
  };

  const uploadTargets = [];
  for (const f of files) {
    const key = `deliveries/${order.id}/${randomUUID()}-${f.fileName}`;
    const uploadUrl = await getSignedUploadUrl(key, f.fileType);
    await prisma.vaultItem.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        fileUrl: key,
        fileName: f.fileName,
        fileType: f.fileType,
        previewUrl: f.previewUrl ?? null
      }
    });
    uploadTargets.push({ fileName: f.fileName, uploadUrl });
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "COMPLETED" } });
  await prisma.notification.create({
    data: { userId: order.customerId, type: "files_delivered", message: "Your files are ready in your Vault." }
  });
  await dmStatusUpdate({
    discordId: order.customer.discordId,
    orderId: order.id,
    status: "COMPLETED",
    message: "Your files are ready in your Vault."
  });
  await refreshOrderQueue();

  if (order.discordTicketChannelId) {
    await closeOrderTicket(order.discordTicketChannelId, order.customer.discordId);
  }

  return NextResponse.json({ uploadTargets });
}
