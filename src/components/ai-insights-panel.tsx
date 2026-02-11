"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/lib/scrapers/types";
import { Insights } from "@/lib/ai/schemas";

interface AiInsightsPanelProps {
  source: Product;
  match: Product;
}

function ProsConsList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "pro" | "con";
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={type === "pro" ? "text-green-600" : "text-red-500"}>
              {type === "pro" ? "+" : "-"}
            </span>
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AiInsightsPanel({ source, match }: AiInsightsPanelProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, match }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to generate insights");
          return;
        }

        setInsights(data.insights);
      } catch {
        setError("Failed to get AI insights");
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [source, match]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const amazonAnalysis = insights.productAnalysis.find((a) => a.platform === "amazon");
  const ebayAnalysis = insights.productAnalysis.find((a) => a.platform === "ebay");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>AI Analysis</span>
          <Badge variant="secondary" className="text-xs">
            Powered by Claude
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <p className="text-sm leading-relaxed">{insights.summary}</p>
        </div>

        <Separator />

        {/* Pros/Cons */}
        <div className="grid gap-6 sm:grid-cols-2">
          {amazonAnalysis && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                  Amazon
                </Badge>
              </h3>
              <ProsConsList title="Pros" items={amazonAnalysis.pros} type="pro" />
              <ProsConsList title="Cons" items={amazonAnalysis.cons} type="con" />
            </div>
          )}
          {ebayAnalysis && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  eBay
                </Badge>
              </h3>
              <ProsConsList title="Pros" items={ebayAnalysis.pros} type="pro" />
              <ProsConsList title="Cons" items={ebayAnalysis.cons} type="con" />
            </div>
          )}
        </div>

        <Separator />

        {/* Verdict */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Verdict</h3>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Recommended:</span>
              <Badge
                className={
                  insights.verdict.recommendation === "amazon"
                    ? "bg-orange-500"
                    : insights.verdict.recommendation === "ebay"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                }
              >
                {insights.verdict.recommendation === "either"
                  ? "Either Platform"
                  : insights.verdict.recommendation === "amazon"
                    ? "Amazon"
                    : "eBay"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {insights.verdict.reasoning}
            </p>
            {insights.verdict.bestFor.length > 0 && (
              <div className="mt-3 space-y-1">
                {insights.verdict.bestFor.map((bf, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium">{bf.audience}:</span>{" "}
                    {bf.platform === "amazon" ? "Amazon" : "eBay"} — {bf.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Price Analysis */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Price Analysis</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Better Deal:</span>{" "}
              {insights.priceAnalysis.betterDeal === "similar"
                ? "Similar pricing"
                : insights.priceAnalysis.betterDeal === "amazon"
                  ? "Amazon"
                  : "eBay"}
            </p>
            <p>
              <span className="font-medium">Savings:</span>{" "}
              {insights.priceAnalysis.savings}
            </p>
            <p>
              <span className="font-medium">Price Fairness:</span>{" "}
              {insights.priceAnalysis.fairness}
            </p>
          </div>
        </div>

        {/* Buying Tips */}
        {insights.buyingTips.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-semibold">Buying Tips</h3>
              <ul className="space-y-1">
                {insights.buyingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
