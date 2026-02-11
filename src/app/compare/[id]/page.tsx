"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ComparisonTable } from "@/components/comparison-table";
import { AiInsightsPanel } from "@/components/ai-insights-panel";
import { Product } from "@/lib/scrapers/types";

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const [source, setSource] = useState<Product | null>(null);
  const [match, setMatch] = useState<Product | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const stored = sessionStorage.getItem(`compare:${id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSource(data.source);
        setMatch(data.match);
      } catch {
        // ignore
      }
    }
  }, [params.id]);

  if (!source || !match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/product/${params.id}`)}
        >
          &larr; Back to Product
        </Button>
        <h1 className="text-lg font-semibold">Product Comparison</h1>
      </div>

      <div className="space-y-6">
        <ComparisonTable source={source} match={match} />
        <AiInsightsPanel source={source} match={match} />
      </div>
    </div>
  );
}
