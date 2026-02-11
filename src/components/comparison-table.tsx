"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlatformBadge } from "./platform-badge";
import { RatingDisplay } from "./rating-display";
import { Product } from "@/lib/scrapers/types";

interface ComparisonTableProps {
  source: Product;
  match: Product;
}

function ComparisonRow({
  label,
  sourceValue,
  matchValue,
  highlight,
}: {
  label: string;
  sourceValue: React.ReactNode;
  matchValue: React.ReactNode;
  highlight?: "source" | "match" | null;
}) {
  return (
    <>
      {/* Desktop: 3-column grid */}
      <div className="hidden sm:grid grid-cols-3 gap-4 py-3">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div
          className={`text-sm ${highlight === "source" ? "font-semibold text-green-700" : ""}`}
        >
          {sourceValue}
        </div>
        <div
          className={`text-sm ${highlight === "match" ? "font-semibold text-green-700" : ""}`}
        >
          {matchValue}
        </div>
      </div>
      {/* Mobile: stacked */}
      <div className="sm:hidden py-3 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`text-sm ${highlight === "source" ? "font-semibold text-green-700" : ""}`}>
            {sourceValue}
          </div>
          <div className={`text-sm ${highlight === "match" ? "font-semibold text-green-700" : ""}`}>
            {matchValue}
          </div>
        </div>
      </div>
    </>
  );
}

export function ComparisonTable({ source, match }: ComparisonTableProps) {
  const sourceTotal = source.price + (source.shippingCost ?? 0);
  const matchTotal = match.price + (match.shippingCost ?? 0);
  const priceBetter = sourceTotal < matchTotal ? "source" : sourceTotal > matchTotal ? "match" : null;
  const ratingBetter =
    source.rating.average > match.rating.average
      ? "source"
      : source.rating.average < match.rating.average
        ? "match"
        : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Product headers - Desktop */}
        <div className="hidden sm:grid grid-cols-3 gap-4 pb-4">
          <div />
          {[source, match].map((product) => (
            <div key={product.id} className="flex flex-col items-center gap-2">
              {product.images[0]?.url && (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                    unoptimized
                  />
                </div>
              )}
              <PlatformBadge platform={product.platform} />
              <p className="line-clamp-2 text-center text-xs font-medium">
                {product.title}
              </p>
            </div>
          ))}
        </div>

        {/* Product headers - Mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-4 pb-4">
          {[source, match].map((product) => (
            <div key={product.id} className="flex flex-col items-center gap-2">
              {product.images[0]?.url && (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                    unoptimized
                  />
                </div>
              )}
              <PlatformBadge platform={product.platform} />
              <p className="line-clamp-2 text-center text-xs font-medium">
                {product.title}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Comparison rows */}
        <div className="divide-y">
          <ComparisonRow
            label="Price"
            sourceValue={`$${source.price.toFixed(2)}`}
            matchValue={`$${match.price.toFixed(2)}`}
            highlight={priceBetter}
          />
          <ComparisonRow
            label="Shipping"
            sourceValue={
              source.shippingCost !== undefined
                ? source.shippingCost === 0
                  ? "Free"
                  : `$${source.shippingCost.toFixed(2)}`
                : "Unknown"
            }
            matchValue={
              match.shippingCost !== undefined
                ? match.shippingCost === 0
                  ? "Free"
                  : `$${match.shippingCost.toFixed(2)}`
                : "Unknown"
            }
          />
          <ComparisonRow
            label="Total Cost"
            sourceValue={
              <span className="text-base font-bold">
                ${sourceTotal.toFixed(2)}
              </span>
            }
            matchValue={
              <span className="text-base font-bold">
                ${matchTotal.toFixed(2)}
              </span>
            }
            highlight={priceBetter}
          />
          <ComparisonRow
            label="Rating"
            sourceValue={<RatingDisplay rating={source.rating} />}
            matchValue={<RatingDisplay rating={match.rating} />}
            highlight={ratingBetter}
          />
          <ComparisonRow
            label="Reviews"
            sourceValue={source.rating.count.toLocaleString()}
            matchValue={match.rating.count.toLocaleString()}
          />
          <ComparisonRow
            label="Brand"
            sourceValue={source.brand ?? "—"}
            matchValue={match.brand ?? "—"}
          />
          <ComparisonRow
            label="Condition"
            sourceValue={source.condition ?? "—"}
            matchValue={match.condition ?? "—"}
          />
          <ComparisonRow
            label="Seller"
            sourceValue={source.seller?.name ?? "—"}
            matchValue={match.seller?.name ?? "—"}
          />
          <ComparisonRow
            label="Availability"
            sourceValue={source.availability ?? "—"}
            matchValue={match.availability ?? "—"}
          />
        </div>

        <Separator className="mt-2" />

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
          <div className="hidden sm:block" />
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm text-primary hover:underline"
          >
            View on {source.platform === "amazon" ? "Amazon" : "eBay"}
          </a>
          <a
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm text-primary hover:underline"
          >
            View on {match.platform === "amazon" ? "Amazon" : "eBay"}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
