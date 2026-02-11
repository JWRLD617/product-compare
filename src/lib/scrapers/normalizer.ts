import { Product, Platform } from "./types";
import { fetchAmazonProduct, normalizeAmazonProduct } from "./amazon";
import { fetchEbayProduct, normalizeEbayProduct, isEbayConfigured } from "./ebay";

export async function fetchAndNormalizeProduct(
  platform: Platform,
  productId: string
): Promise<Product> {
  switch (platform) {
    case "amazon": {
      const data = await fetchAmazonProduct(productId);
      const product = normalizeAmazonProduct(data);
      if (!product) throw new Error("Failed to normalize Amazon product");
      return product;
    }
    case "ebay": {
      if (!isEbayConfigured()) {
        throw new Error("eBay integration is being set up. Please try an Amazon URL for now.");
      }
      const data = await fetchEbayProduct(productId);
      return normalizeEbayProduct(data);
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\([^)]*\)/g, "") // Remove parenthetical text
    .replace(/\[[^\]]*\]/g, "") // Remove bracketed text
    .replace(/,\s*\d+\s*(pack|count|piece|ct|pk)/gi, "") // Remove pack sizes
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBrandFromTitle(title: string): string | null {
  const words = title.split(/\s+/);
  if (words.length > 0) {
    return words[0];
  }
  return null;
}

export function buildSearchQuery(product: Product): string {
  const parts: string[] = [];

  if (product.brand) {
    parts.push(product.brand);
  }

  const cleaned = cleanTitle(product.title);
  // Take first ~6 meaningful words from title (skip brand if already added)
  const titleWords = cleaned.split(/\s+/);
  const start = product.brand && titleWords[0]?.toLowerCase() === product.brand.toLowerCase() ? 1 : 0;
  parts.push(...titleWords.slice(start, start + 6));

  return parts.join(" ");
}
