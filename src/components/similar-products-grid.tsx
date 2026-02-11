"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./product-card";
import { Product, MatchResult } from "@/lib/scrapers/types";

interface SimilarProductsGridProps {
  sourceProduct: Product;
}

export function SimilarProductsGrid({ sourceProduct }: SimilarProductsGridProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: sourceProduct }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to find matches");
          return;
        }

        setMatches(data.matches || []);
      } catch {
        setError("Failed to search for similar products");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [sourceProduct]);

  function handleCompare() {
    if (selectedMatch === null) return;
    const match = matches[selectedMatch];

    // Store both products for the comparison page
    sessionStorage.setItem(
      `compare:${sourceProduct.id}`,
      JSON.stringify({ source: sourceProduct, match: match.product })
    );

    router.push(`/compare/${sourceProduct.id}`);
  }

  const targetPlatform = sourceProduct.platform === "amazon" ? "eBay" : "Amazon";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Similar on {targetPlatform}</span>
          {matches.length > 0 && selectedMatch !== null && (
            <Button size="sm" onClick={handleCompare}>
              Compare Selected
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No similar products found on {targetPlatform}.
          </p>
        )}

        {!loading && matches.length > 0 && (
          <div className="flex flex-col gap-3">
            {matches.map((match, i) => (
              <div key={match.product.id} className="relative">
                <ProductCard
                  product={match.product}
                  onClick={() => setSelectedMatch(i === selectedMatch ? null : i)}
                  selected={i === selectedMatch}
                />
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 text-xs"
                >
                  {Math.round(match.confidence * 100)}% match
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
