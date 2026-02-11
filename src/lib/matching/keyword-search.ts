import { Product, MatchResult, Platform } from "../scrapers/types";
import { buildSearchQuery } from "../scrapers/normalizer";
import { searchAmazonProducts, normalizeAmazonSearchResults } from "../scrapers/amazon";
import { searchEbayProducts, normalizeEbaySearchResults, isEbayConfigured } from "../scrapers/ebay";

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

function brandMatch(source: Product, candidate: Product): number {
  if (!source.brand || !candidate.brand) return 0;
  return source.brand.toLowerCase() === candidate.brand.toLowerCase() ? 1 : 0;
}

function priceProximity(source: Product, candidate: Product): number {
  if (source.price === 0 || candidate.price === 0) return 0;
  const ratio = Math.min(source.price, candidate.price) / Math.max(source.price, candidate.price);
  return ratio;
}

function scoreMatch(source: Product, candidate: Product): number {
  const titleScore = titleSimilarity(source.title, candidate.title) * 0.5;
  const brandScore = brandMatch(source, candidate) * 0.3;
  const priceScore = priceProximity(source, candidate) * 0.2;

  return titleScore + brandScore + priceScore;
}

export async function matchByKeyword(
  product: Product,
  targetPlatform: Platform
): Promise<MatchResult[]> {
  const query = buildSearchQuery(product);

  try {
    let candidates: Product[];

    if (targetPlatform === "ebay") {
      if (!isEbayConfigured()) return [];
      const results = await searchEbayProducts(query, { limit: 10 });
      candidates = normalizeEbaySearchResults(results);
    } else {
      const results = await searchAmazonProducts(query);
      candidates = normalizeAmazonSearchResults(results);
    }

    return candidates
      .map((candidate) => {
        const score = scoreMatch(product, candidate);
        return {
          product: candidate,
          confidence: Math.min(score, 0.85),
          matchMethod: "keyword" as const,
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  } catch (e) {
    console.warn("Keyword search failed:", e);
    return [];
  }
}
