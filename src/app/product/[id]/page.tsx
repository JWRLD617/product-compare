"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetail } from "@/components/product-detail";
import { SimilarProductsGrid } from "@/components/similar-products-grid";
import { Product } from "@/lib/scrapers/types";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const stored = sessionStorage.getItem(`product:${id}`);
    if (stored) {
      try {
        setProduct(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          &larr; Back
        </Button>
        <h1 className="text-lg font-semibold">Product Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProductDetail product={product} />
        </div>
        <div className="lg:col-span-2">
          <SimilarProductsGrid sourceProduct={product} />
        </div>
      </div>
    </div>
  );
}
