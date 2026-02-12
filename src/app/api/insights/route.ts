import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/scrapers/types";
import { generateInsights } from "@/lib/ai/client";
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

    const { source, match } = (await req.json()) as {
      source: Product;
      match: Product;
    };

    if (!source || !match) {
      return NextResponse.json(
        { error: "Both products are required for insights" },
        { status: 400 }
      );
    }

    const insights = await generateInsights(source, match);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
