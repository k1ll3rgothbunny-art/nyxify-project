/**
 * Cash App Pay is processed through Square (Cash App's parent company) —
 * there's no separate "Cash App" merchant API. The customer taps Cash App
 * Pay in Square's Web Payments SDK on the frontend, which returns a
 * one-time token; this exchanges that token for an actual charge.
 */
const BASE = process.env.SQUARE_ENV === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";

export async function createSquarePayment(opts: { sourceId: string; amountCents: number; orderId: string }) {
  const res = await fetch(`${BASE}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-07-17"
    },
    body: JSON.stringify({
      source_id: opts.sourceId,
      idempotency_key: `${opts.orderId}-${Date.now()}`,
      amount_money: { amount: opts.amountCents, currency: "USD" },
      location_id: process.env.SQUARE_LOCATION_ID,
      note: `Nyxify order ${opts.orderId}`
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Square payment failed: ${JSON.stringify(data)}`);
  return data.payment;
}
