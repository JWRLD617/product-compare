import { NextRequest, NextResponse } from "next/server";
import { parseProductUrl } from "@/lib/scrapers/url-parser";
import { fetchAndNormalizeProduct } from "@/lib/scrapers/normalizer";
import { cached, CACHE_TTL } from "@/lib/cache/redis";

export async function POST(req: NextRequest) {
  try {
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
