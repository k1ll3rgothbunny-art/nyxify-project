"use client";
import { useState } from "react";
import ReviewForm from "./ReviewForm";

export default function OrderReviewPrompt({ orderId, hasReview }: { orderId: string; hasReview: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (hasReview || submitted) {
    return <p className="mt-2 text-xs text-nyx-pink2">✓ Review submitted — thank you!</p>;
  }

  return (
    <div className="mt-2">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full border border-nyx-line px-3 py-1.5 text-xs font-semibold text-white hover:border-nyx-pink"
        >
          Leave a review
        </button>
      ) : (
        <ReviewForm orderId={orderId} onSubmitted={() => setSubmitted(true)} />
      )}
    </div>
  );
}
