"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductUrlForm } from "@/components/product-url-form";

interface RecentSearch {
  url: string;
  title: string;
  platform: string;
  id: string;
  timestamp: number;
}

export default function Home() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 pt-24 pb-12">
      <div className="flex flex-col items-center gap-6 text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Product Compare
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Paste a product URL from Amazon or eBay. Get structured data,
          cross-platform matches, and AI-powered buying advice.
        </p>
      </div>

      <ProductUrlForm />

      {recentSearches.length > 0 && (
        <div className="mt-12 w-full max-w-2xl">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Recent Searches
          </h2>
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <button
                key={search.id}
                onClick={() => {
                  const stored = sessionStorage.getItem(`product:${search.id}`);
                  if (stored) {
                    router.push(`/product/${search.id}`);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    search.platform === "amazon"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {search.platform === "amazon" ? "Amazon" : "eBay"}
                </span>
                <span className="line-clamp-1 text-sm">{search.title}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(search.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
