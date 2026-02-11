"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge } from "./platform-badge";
import { RatingDisplay } from "./rating-display";
import { Product } from "@/lib/scrapers/types";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  selected?: boolean;
}

export function ProductCard({ product, onClick, selected }: ProductCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      } ${onClick ? "hover:scale-[1.01]" : ""}`}
      onClick={onClick}
    >
      <CardContent className="flex gap-4 p-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {product.images[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.title}
              fill
              className="object-contain"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-medium leading-tight">
              {product.title}
            </h3>
            <PlatformBadge platform={product.platform} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.shippingCost !== undefined && (
              <span className="text-xs text-muted-foreground">
                {product.shippingCost === 0
                  ? "+ Free shipping"
                  : `+ $${product.shippingCost.toFixed(2)} shipping`}
              </span>
            )}
          </div>

          <RatingDisplay rating={product.rating} />
        </div>
      </CardContent>
    </Card>
  );
}
