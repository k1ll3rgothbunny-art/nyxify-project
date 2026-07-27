"use client";
import { useState } from "react";

export default function RegisterDiscordCommandButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleClick() {
    setStatus("loading");
    const res = await fetch("/api/admin/discord/register-commands", { method: "POST" });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Registering…" : status === "done" ? "Registered ✅" : "Register /deliver command"}
      </button>
      {status === "error" && <p className="mt-1 max-w-xs text-xs text-red-400">{errorMsg}</p>}
    </div>
  );
}
