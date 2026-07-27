"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Square?: any;
  }
}

export default function CashAppPayButton({ orderId, amountCents, payDeposit = false }: { orderId: string; amountCents: number; payDeposit?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!appId || !locationId || !containerRef.current) return;

    const scriptId = "square-web-payments-sdk";
    const scriptSrc =
      process.env.NEXT_PUBLIC_SQUARE_ENV === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

    let cashAppPay: any;

    async function setup() {
      if (!window.Square || !containerRef.current) return;
      const payments = window.Square.payments(appId, locationId);

      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: { amount: (amountCents / 100).toFixed(2), label: "Total" }
      });

      cashAppPay = await payments.cashAppPay(paymentRequest, {
        redirectURL: window.location.href,
        referenceId: orderId
      });

      await cashAppPay.attach(containerRef.current, { theme: "dark", size: "medium" });

      cashAppPay.addEventListener("ontokenization", async (event: any) => {
        const { tokenResult } = event.detail;
        if (tokenResult.status !== "OK") {
          setStatus("error");
          return;
        }
        setStatus("loading");
        const res = await fetch("/api/checkout/cashapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, sourceId: tokenResult.token, payDeposit })
        });
        setStatus(res.ok ? "done" : "error");
        if (res.ok) window.location.reload();
      });
    }

    if (window.Square) {
      setup();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptSrc;
      script.onload = setup;
      document.body.appendChild(script);
    }

    return () => {
      cashAppPay?.destroy?.();
    };
  }, [orderId, amountCents, payDeposit]);

  return (
    <div>
      <div ref={containerRef} className="min-w-[160px]" />
      {status === "error" && <p className="mt-1 text-xs text-red-400">Payment didn't go through — try again.</p>}
    </div>
  );
}
