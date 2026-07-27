"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({ orderId, payDeposit = false }: { orderId: string; payDeposit?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || !containerRef.current) return;

    const scriptId = "paypal-sdk";
    function render() {
      if (!window.paypal || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          style: { color: "blue", shape: "pill", label: "paypal", height: 40 },
          createOrder: async () => {
            setStatus("loading");
            const res = await fetch("/api/checkout/paypal/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, payDeposit })
            });
            const data = await res.json();
            (window as any).__nyxifyAmount = data.amountCents;
            return data.paypalOrderId;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch("/api/checkout/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                paypalOrderId: data.orderID,
                amountCents: (window as any).__nyxifyAmount,
                payDeposit
              })
            });
            setStatus(res.ok ? "done" : "error");
            if (res.ok) window.location.reload();
          },
          onError: () => setStatus("error")
        })
        .render(containerRef.current);
    }

    if (window.paypal) {
      render();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.onload = render;
      document.body.appendChild(script);
    }
  }, [orderId, payDeposit]);

  return (
    <div>
      <div ref={containerRef} className="min-w-[160px]" />
      {status === "error" && <p className="mt-1 text-xs text-red-400">Payment didn't go through — try again.</p>}
    </div>
  );
}
