"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { detectPlatform } from "@/lib/scrapers/url-parser";

export function ProductUrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const platform = url ? detectPlatform(url) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to extract product data");
        return;
      }

      // Save to sessionStorage for the product page
      sessionStorage.setItem(`product:${data.product.id}`, JSON.stringify(data.product));

      // Save to recent searches
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]") as Array<{
        url: string;
        title: string;
        platform: string;
        id: string;
        timestamp: number;
      }>;
      recent.unshift({
        url,
        title: data.product.title,
        platform: data.product.platform,
        id: data.product.id,
        timestamp: Date.now(),
      });
      localStorage.setItem("recentSearches", JSON.stringify(recent.slice(0, 10)));

      router.push(`/product/${data.product.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="product-url" className="text-sm font-medium">
              Product URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="product-url"
                  type="url"
                  placeholder="Paste an Amazon or eBay product URL..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  className="pr-20"
                  disabled={loading}
                />
                {platform && (
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      platform === "amazon"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {platform === "amazon" ? "Amazon" : "eBay"}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={loading || !url.trim()}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Supports Amazon (.com, .co.uk, etc.) and eBay product URLs
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
