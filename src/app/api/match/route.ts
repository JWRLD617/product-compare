import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/scrapers/types";
import { findMatches } from "@/lib/matching/strategy";

export async function POST(req: NextRequest) {
  try {
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
