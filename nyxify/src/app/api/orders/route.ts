import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openOrderTicket } from "@/lib/discord-bridge";
import { getSignedUploadUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

const VALID_SERVICES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: { referenceFiles: true }
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const discordId = (session.user as any).discordId as string;

  const formData = await req.formData();
  const service = String(formData.get("service") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const referenceFiles = formData.getAll("references") as File[];

  if (!VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      customerId: userId,
      service: service as any,
      notes,
      status: "AWAITING_QUOTE"
    }
  });

  // Reference files are uploaded straight to private storage; we only
  // persist the object key, never a public URL, on the order record.
  for (const file of referenceFiles) {
    if (!(file instanceof File)) continue;
    const key = `references/${order.id}/${randomUUID()}-${file.name}`;
    await getSignedUploadUrl(key, file.type || "application/octet-stream");
    await prisma.orderFile.create({
      data: { orderId: order.id, url: key, kind: "reference" }
    });
  }

  const ticket = await openOrderTicket({
    discordId,
    orderId: order.id,
    service,
    referenceNote: notes
  });

  if (ticket?.channelId) {
    await prisma.order.update({ where: { id: order.id }, data: { discordTicketChannelId: ticket.channelId } });
  }

  return NextResponse.json(order, { status: 201 });
}
