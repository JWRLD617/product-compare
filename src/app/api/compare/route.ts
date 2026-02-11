import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/scrapers/types";

export async function POST(req: NextRequest) {
  try {
    const { source, match } = (await req.json()) as {
      source: Product;
      match: Product;
    };

    if (!source || !match) {
      return NextResponse.json(
        { error: "Both source and match products are required" },
        { status: 400 }
      );
    }

    // Build comparison data
    const comparison = {
      source,
      match,
      priceDiff: match.price - source.price,
      priceDiffPercent:
        source.price > 0
          ? ((match.price - source.price) / source.price) * 100
          : 0,
      totalCostSource: source.price + (source.shippingCost ?? 0),
      totalCostMatch: match.price + (match.shippingCost ?? 0),
      ratingDiff: match.rating.average - source.rating.average,
      reviewCountDiff: match.rating.count - source.rating.count,
    };

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Compare error:", error);
    const message = error instanceof Error ? error.message : "Failed to build comparison";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
