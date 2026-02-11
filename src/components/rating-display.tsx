"use client";

import { ProductRating } from "@/lib/scrapers/types";

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          fill="url(#halfStar)"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`h-4 w-4 ${filled ? "text-yellow-400" : "text-gray-300"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function RatingDisplay({ rating }: { rating: ProductRating }) {
  const stars = [];
  const fullStars = Math.floor(rating.average);
  const hasHalf = rating.average - fullStars >= 0.3;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<StarIcon key={i} filled />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<StarIcon key={i} filled={false} half />);
    } else {
      stars.push(<StarIcon key={i} filled={false} />);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">{stars}</div>
      <span className="text-sm font-medium">{rating.average.toFixed(1)}</span>
      {rating.count > 0 && (
        <span className="text-sm text-muted-foreground">
          ({rating.count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
