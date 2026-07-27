"use client";
import { useState } from "react";

type VaultItem = {
  id: string;
  fileName: string;
  fileType: string;
  previewUrl: string | null;
  orderService: string;
  createdAt: string;
};

export default function VaultGrid({ items }: { items: VaultItem[] }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(id: string) {
    setDownloading(id);
    try {
      const res = await fetch(`/api/vault/${id}/download`);
      if (!res.ok) throw new Error("failed");
      const { url } = await res.json();
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-nyx-muted">Nothing here yet — your files will show up as soon as an order is completed.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="nyx-card overflow-hidden">
          <div className="aspect-square bg-nyx-panel2">
            {item.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.previewUrl} alt={item.fileName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-nyx-muted">{item.fileType}</div>
            )}
          </div>
          <div className="p-3">
            <p className="truncate text-xs text-nyx-muted">{item.orderService}</p>
            <p className="truncate text-sm font-medium text-white">{item.fileName}</p>
            <button
              onClick={() => handleDownload(item.id)}
              disabled={downloading === item.id}
              className="mt-2 w-full rounded-full bg-nyx-pink/15 px-3 py-1.5 text-xs font-semibold text-nyx-pink2 hover:bg-nyx-pink/25 disabled:opacity-50"
            >
              {downloading === item.id ? "Preparing…" : "Download"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
