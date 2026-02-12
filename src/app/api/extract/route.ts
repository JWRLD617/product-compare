import { NextRequest, NextResponse } from "next/server";
import { parseProductUrl } from "@/lib/scrapers/url-parser";
import { fetchAndNormalizeProduct } from "@/lib/scrapers/normalizer";
import { cached, CACHE_TTL } from "@/lib/cache/redis";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const parsed = parseProductUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse URL. Please provide a valid Amazon or eBay product URL." },
        { status: 400 }
      );
    }

    const cacheKey = `product:${parsed.platform}:${parsed.productId}`;
    const product = await cached(cacheKey, CACHE_TTL.PRODUCT, () =>
      fetchAndNormalizeProduct(parsed.platform, parsed.productId)
    );

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Extract error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract product data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
