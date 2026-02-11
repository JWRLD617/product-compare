import { Product, MatchResult, Platform } from "../scrapers/types";
import { matchByUpc } from "./upc-lookup";
import { matchByKeyword } from "./keyword-search";
import { cached, CACHE_TTL } from "../cache/redis";

function getTargetPlatform(source: Platform): Platform {
  return source === "amazon" ? "ebay" : "amazon";
}

export async function findMatches(product: Product): Promise<MatchResult[]> {
  const targetPlatform = getTargetPlatform(product.platform);
  const cacheKey = `match:${product.platform}:${product.platformId}`;

  return cached(cacheKey, CACHE_TTL.MATCH, async () => {
    // Tier 1: UPC exact match
    const upcMatches = await matchByUpc(product, targetPlatform);
    if (upcMatches.length > 0) {
      return upcMatches;
    }

    // Tier 2: Keyword search with scoring
    const keywordMatches = await matchByKeyword(product, targetPlatform);
    if (keywordMatches.length > 0) {
      return keywordMatches;
    }

    return [];
  });
}
