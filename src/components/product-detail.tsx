"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlatformBadge } from "./platform-badge";
import { RatingDisplay } from "./rating-display";
import { Product } from "@/lib/scrapers/types";

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <PlatformBadge platform={product.platform} />
              {product.condition && (
                <Badge variant="secondary">{product.condition}</Badge>
              )}
            </div>
            <CardTitle className="text-xl leading-tight">
              {product.title}
            </CardTitle>
            {product.brand && (
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium">{product.brand}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Images */}
        {product.images.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-lg bg-gray-50">
              <Image
                src={product.images[selectedImage]?.url ?? ""}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="256px"
                unoptimized
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {product.images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-12 w-12 overflow-hidden rounded border-2 transition-colors ${
                      i === selectedImage
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="48px"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Price + Rating */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
              {product.listPrice && product.listPrice > product.price && (
                <p className="text-lg text-muted-foreground line-through">
                  ${product.listPrice.toFixed(2)}
                </p>
              )}
            </div>
            {product.shippingCost !== undefined && (
              <p className="text-sm text-muted-foreground">
                {product.shippingCost === 0
                  ? "Free shipping"
                  : `+ $${product.shippingCost.toFixed(2)} shipping`}
              </p>
            )}
          </div>
          <div>
            <RatingDisplay rating={product.rating} />
          </div>
          {product.availability && (
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              {product.availability}
            </Badge>
          )}
        </div>

        {/* Offers / Deals */}
        {product.offers && product.offers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.offers.map((offer, i) => (
              <Badge
                key={i}
                className={
                  offer.type === "coupon"
                    ? "bg-green-600 hover:bg-green-700"
                    : offer.type === "deal"
                      ? "bg-red-600 hover:bg-red-700"
                      : offer.type === "sale"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-purple-600 hover:bg-purple-700"
                }
              >
                {offer.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Seller */}
        {product.seller && (
          <>
            <Separator />
            <div>
              <h3 className="mb-1 text-sm font-medium">Seller</h3>
              <p className="text-sm">
                {product.seller.name}
                {product.seller.rating !== undefined && (
                  <span className="text-muted-foreground">
                    {" "}({product.seller.rating}% positive)
                  </span>
                )}
              </p>
            </div>
          </>
        )}

        {/* Description */}
        {product.description && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </>
        )}

        {/* Specs */}
        {product.specs.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">Specifications</h3>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-medium text-muted-foreground min-w-[120px]">
                      {spec.name}
                    </span>
                    <span>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-3 text-sm font-medium">
                Top Reviews ({product.reviews.length})
              </h3>
              <div className="space-y-3">
                {product.reviews.map((review, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <svg
                              key={s}
                              className={`h-3 w-3 ${s < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.title && (
                          <span className="text-xs font-medium">{review.title}</span>
                        )}
                      </div>
                      {review.author && (
                        <span className="text-xs text-muted-foreground">{review.author}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* External link */}
        <Separator />
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          View on {product.platform === "amazon" ? "Amazon" : "eBay"} &rarr;
        </a>
      </CardContent>
    </Card>
  );
}
