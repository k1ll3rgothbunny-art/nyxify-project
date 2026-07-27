const STYLES: Record<string, string> = {
  AWAITING_QUOTE: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  AWAITING_PAYMENT: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  PAID: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  IN_PROGRESS: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  WAITING_ON_CUSTOMER: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  REVISION_REQUESTED: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  COMPLETED: "bg-nyx-pink/15 text-nyx-pink2 border-nyx-pink/40",
  ARCHIVED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
};

const LABELS: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Quote",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAID: "Paid",
  IN_PROGRESS: "In Progress",
  WAITING_ON_CUSTOMER: "Waiting on You",
  REVISION_REQUESTED: "Revision Requested",
  COMPLETED: "Completed",
  ARCHIVED: "Archived"
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STYLES[status] ?? ""}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
