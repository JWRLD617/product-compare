import { Product, MatchResult, Platform } from "../scrapers/types";
import { searchAmazonProducts, normalizeAmazonSearchResults } from "../scrapers/amazon";
import { searchEbayProducts, normalizeEbaySearchResults, isEbayConfigured } from "../scrapers/ebay";

export async function matchByUpc(
  product: Product,
  targetPlatform: Platform
): Promise<MatchResult[]> {
  const upc = product.upc || product.ean;
  if (!upc) return [];

  try {
    if (targetPlatform === "ebay") {
      if (!isEbayConfigured()) return [];
      const results = await searchEbayProducts("", { upc });
      const products = normalizeEbaySearchResults(results);
      return products.map((p) => ({
        product: p,
        confidence: 0.95,
        matchMethod: "upc" as const,
      }));
    } else {
      const results = await searchAmazonProducts("", { upc });
      const products = normalizeAmazonSearchResults(results);
      return products.map((p) => ({
        product: p,
        confidence: 0.95,
        matchMethod: "upc" as const,
      }));
    }
  } catch (e) {
    console.warn("UPC lookup failed:", e);
    return [];
  }
}
