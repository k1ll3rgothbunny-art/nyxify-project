export default function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-nyx-pink2" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}
