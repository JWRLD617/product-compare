import { nanoid } from "nanoid";
import { Product } from "./types";

interface EbayTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface EbayItem {
  itemId?: string;
  title?: string;
  price?: { value?: string; currency?: string };
  image?: { imageUrl?: string };
  additionalImages?: Array<{ imageUrl?: string }>;
  condition?: string;
  seller?: { username?: string; feedbackPercentage?: string };
  itemWebUrl?: string;
  shortDescription?: string;
  brand?: string;
  mpn?: string;
  gtin?: string;
  categoryPath?: string;
  shippingOptions?: Array<{
    shippingCost?: { value?: string; currency?: string };
    type?: string;
  }>;
  localizedAspects?: Array<{ name?: string; value?: string }>;
  estimatedAvailabilities?: Array<{
    estimatedAvailabilityStatus?: string;
  }>;
  primaryProductReviewRating?: {
    reviewCount?: number;
    averageRating?: string;
  };
}

interface EbaySearchResponse {
  itemSummaries?: Array<{
    itemId?: string;
    title?: string;
    price?: { value?: string; currency?: string };
    image?: { imageUrl?: string };
    condition?: string;
    seller?: { username?: string; feedbackPercentage?: string };
    itemWebUrl?: string;
    shippingOptions?: Array<{
      shippingCost?: { value?: string; currency?: string };
    }>;
  }>;
  total?: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEbayToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;
  if (!appId || !certId) throw new Error("eBay credentials not set");

  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!res.ok) {
    throw new Error(`eBay auth error: ${res.status} ${res.statusText}`);
  }

  const data: EbayTokenResponse = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export async function fetchEbayProduct(itemId: string): Promise<EbayItem> {
  const token = await getEbayToken();

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "X-EBAY-C-ENDUSERCTX": "affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>",
      },
    }
  );

  if (!res.ok) {
    // Try without the v1| wrapper
    const res2 = await fetch(
      `https://api.ebay.com/buy/browse/v1/item/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      }
    );
    if (!res2.ok) {
      throw new Error(`eBay API error: ${res2.status}`);
    }
    return res2.json();
  }

  return res.json();
}

export async function searchEbayProducts(
  query: string,
  options?: { upc?: string; limit?: number }
): Promise<EbaySearchResponse> {
  const token = await getEbayToken();
  const limit = options?.limit ?? 10;

  const params = new URLSearchParams({ limit: String(limit) });

  if (options?.upc) {
    params.set("gtin", options.upc);
  } else {
    params.set("q", query);
  }

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`eBay search error: ${res.status}`);
  }

  return res.json();
}

export function normalizeEbayProduct(item: EbayItem): Product {
  const price = parseFloat(item.price?.value ?? "0");
  const shippingCost = item.shippingOptions?.[0]?.shippingCost?.value
    ? parseFloat(item.shippingOptions[0].shippingCost.value)
    : undefined;

  const images = [
    ...(item.image?.imageUrl ? [{ url: item.image.imageUrl }] : []),
    ...(item.additionalImages?.map((img) => ({ url: img.imageUrl ?? "" })) ?? []),
  ];

  return {
    id: nanoid(),
    platform: "ebay",
    platformId: item.itemId ?? "",
    title: item.title ?? "Unknown Product",
    price,
    currency: item.price?.currency ?? "USD",
    url: item.itemWebUrl ?? "",
    images,
    rating: {
      average: parseFloat(item.primaryProductReviewRating?.averageRating ?? "0"),
      count: item.primaryProductReviewRating?.reviewCount ?? 0,
    },
    brand: item.brand ?? item.localizedAspects?.find((a) => a.name === "Brand")?.value,
    category: item.categoryPath,
    description: item.shortDescription,
    specs: item.localizedAspects?.map((a) => ({
      name: a.name ?? "",
      value: a.value ?? "",
    })) ?? [],
    seller: item.seller
      ? {
          name: item.seller.username ?? "Unknown",
          rating: item.seller.feedbackPercentage
            ? parseFloat(item.seller.feedbackPercentage)
            : undefined,
        }
      : undefined,
    upc: item.gtin,
    condition: item.condition,
    availability: item.estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus,
    shippingCost,
    shippingInfo: item.shippingOptions?.[0]?.type,
    fetchedAt: new Date().toISOString(),
  };
}

export function normalizeEbaySearchResults(
  data: EbaySearchResponse
): Product[] {
  return (data.itemSummaries ?? []).map((item) => ({
    id: nanoid(),
    platform: "ebay" as const,
    platformId: item.itemId ?? "",
    title: item.title ?? "Unknown",
    price: parseFloat(item.price?.value ?? "0"),
    currency: item.price?.currency ?? "USD",
    url: item.itemWebUrl ?? "",
    images: item.image?.imageUrl ? [{ url: item.image.imageUrl }] : [],
    rating: { average: 0, count: 0 },
    brand: undefined,
    specs: [],
    seller: item.seller
      ? { name: item.seller.username ?? "Unknown" }
      : undefined,
    condition: item.condition,
    shippingCost: item.shippingOptions?.[0]?.shippingCost?.value
      ? parseFloat(item.shippingOptions[0].shippingCost.value)
      : undefined,
    fetchedAt: new Date().toISOString(),
  }));
}
