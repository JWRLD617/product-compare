import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/scrapers/types";
import { findMatches } from "@/lib/matching/strategy";
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

    const { product } = (await req.json()) as { product: Product };

    if (!product || !product.platformId) {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 });
    }

    const matches = await findMatches(product);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match error:", error);
    const message = error instanceof Error ? error.message : "Failed to find matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
