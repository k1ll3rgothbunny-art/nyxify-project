import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VaultGrid from "@/components/VaultGrid";

// The Vault only ever queries vault items scoped to the logged-in user's id —
// there is no route or query path that lets one customer see another's files.
export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id as string;
  const items = await prisma.vaultItem.findMany({
    where: { customerId: userId },
    include: { order: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">My Vault</h1>
      <p className="mt-2 text-sm text-nyx-muted">Every completed order, stored here permanently for you.</p>
      <div className="mt-8">
        <VaultGrid items={items.map((i) => ({
          id: i.id,
          fileName: i.fileName,
          fileType: i.fileType,
          previewUrl: i.previewUrl,
          orderService: i.order.service,
          createdAt: i.createdAt.toISOString()
        }))} />
      </div>
    </div>
  );
}
