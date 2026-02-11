import { Platform } from "./types";

export interface ParsedUrl {
  platform: Platform;
  productId: string;
  url: string;
}

const AMAZON_PATTERNS = [
  // Standard product page: /dp/ASIN
  /amazon\.\w+(?:\.\w+)?\/.*?\/dp\/([A-Z0-9]{10})/i,
  // Short URL: /dp/ASIN
  /amazon\.\w+(?:\.\w+)?\/dp\/([A-Z0-9]{10})/i,
  // ASIN in gp/product
  /amazon\.\w+(?:\.\w+)?\/gp\/product\/([A-Z0-9]{10})/i,
  // amzn.to short links (after redirect, the ASIN is in the URL)
  /amzn\.to\/\w+/i,
  // Amazon with /product/ pattern
  /amazon\.\w+(?:\.\w+)?\/.*?(?:\/|%2F)([A-Z0-9]{10})(?:[/?&#]|$)/i,
];

const EBAY_PATTERNS = [
  // Standard listing: /itm/title/ITEM_ID
  /ebay\.\w+(?:\.\w+)?\/itm\/[^/]*\/(\d+)/i,
  // Short listing: /itm/ITEM_ID
  /ebay\.\w+(?:\.\w+)?\/itm\/(\d+)/i,
  // Item with query param
  /ebay\.\w+(?:\.\w+)?\/.*?[?&]item=(\d+)/i,
];

export function parseProductUrl(url: string): ParsedUrl | null {
  const trimmed = url.trim();

  // Try Amazon patterns
  for (const pattern of AMAZON_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return {
        platform: "amazon",
        productId: match[1],
        url: trimmed,
      };
    }
  }

  // Try eBay patterns
  for (const pattern of EBAY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return {
        platform: "ebay",
        productId: match[1],
        url: trimmed,
      };
    }
  }

  return null;
}

export function detectPlatform(url: string): Platform | null {
  if (/amazon\.\w+|amzn\.to/i.test(url)) return "amazon";
  if (/ebay\.\w+/i.test(url)) return "ebay";
  return null;
}

export function isValidProductUrl(url: string): boolean {
  return parseProductUrl(url) !== null;
}
