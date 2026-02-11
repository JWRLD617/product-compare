import { nanoid } from "nanoid";

interface RainforestProduct {
  title?: string;
  price?: { value?: number; currency?: string };
  list_price?: { value?: number; currency?: string };
  rating?: number;
  ratings_total?: number;
  brand?: string;
  main_image?: { link?: string };
  images?: Array<{ link?: string; variant?: string }>;
  description?: string;
  feature_bullets?: string[];
  specifications?: Array<{ name?: string; value?: string }>;
  categories?: Array<{ name?: string }>;
  buybox_winner?: {
    price?: { value?: number; currency?: string };
    shipping?: { raw?: string; value?: number };
    availability?: { raw?: string };
    fulfillment?: { type?: string };
  };
  asin?: string;
  link?: string;
  attributes?: Array<{ name?: string; value?: string }>;
  top_reviews?: Array<{
    title?: string;
    body?: string;
    rating?: number;
    author?: { name?: string };
    date?: { raw?: string };
  }>;
  coupon?: { badge_text?: string; text?: string };
  deal?: { type?: string; badge_text?: string };
  promotions?: Array<{ raw?: string }>;
}

interface RainforestResponse {
  product?: RainforestProduct;
  search_results?: Array<{
    asin?: string;
    title?: string;
    price?: { value?: number; currency?: string };
    rating?: number;
    ratings_total?: number;
    image?: string;
    link?: string;
    brand?: string;
  }>;
  request_info?: { success?: boolean };
}

export async function fetchAmazonProduct(asin: string): Promise<RainforestResponse> {
  const apiKey = process.env.RAINFOREST_API_KEY;
  if (!apiKey) throw new Error("RAINFOREST_API_KEY is not set");

  const params = new URLSearchParams({
    api_key: apiKey,
    type: "product",
    amazon_domain: "amazon.com",
    asin,
  });

  const res = await fetch(`https://api.rainforestapi.com/request?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Rainforest API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function searchAmazonProducts(
  query: string,
  options?: { upc?: string }
): Promise<RainforestResponse> {
  const apiKey = process.env.RAINFOREST_API_KEY;
  if (!apiKey) throw new Error("RAINFOREST_API_KEY is not set");

  const params = new URLSearchParams({
    api_key: apiKey,
    type: "search",
    amazon_domain: "amazon.com",
  });

  if (options?.upc) {
    params.set("search_term", options.upc);
  } else {
    params.set("search_term", query);
  }

  const res = await fetch(`https://api.rainforestapi.com/request?${params}`, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Rainforest API search error: ${res.status}`);
  }

  return res.json();
}

export function normalizeAmazonProduct(data: RainforestResponse): import("./types").Product | null {
  const p = data.product;
  if (!p) return null;

  const price = p.buybox_winner?.price?.value ?? p.price?.value ?? 0;
  const currency = p.buybox_winner?.price?.currency ?? p.price?.currency ?? "USD";

  // Extract UPC from attributes
  const upcAttr = p.attributes?.find(
    (a) => a.name?.toLowerCase().includes("upc") || a.name?.toLowerCase().includes("ean")
  );

  return {
    id: nanoid(),
    platform: "amazon",
    platformId: p.asin ?? "",
    title: p.title ?? "Unknown Product",
    price,
    currency,
    url: p.link ?? `https://www.amazon.com/dp/${p.asin}`,
    images: p.images?.map((img) => ({ url: img.link ?? "", alt: img.variant })) ??
      (p.main_image?.link ? [{ url: p.main_image.link }] : []),
    rating: {
      average: p.rating ?? 0,
      count: p.ratings_total ?? 0,
    },
    brand: p.brand,
    category: p.categories?.[0]?.name,
    description: p.description ??
      p.feature_bullets?.join("\n"),
    specs: p.specifications?.map((s) => ({
      name: s.name ?? "",
      value: s.value ?? "",
    })) ?? [],
    seller: p.buybox_winner?.fulfillment?.type
      ? { name: p.buybox_winner.fulfillment.type }
      : undefined,
    upc: upcAttr?.value,
    condition: "New",
    availability: p.buybox_winner?.availability?.raw,
    shippingInfo: p.buybox_winner?.shipping?.raw,
    shippingCost: p.buybox_winner?.shipping?.value,
    listPrice: p.list_price?.value,
    reviews: p.top_reviews?.slice(0, 5).map((r) => ({
      title: r.title,
      text: r.body ?? "",
      rating: r.rating ?? 0,
      author: r.author?.name,
      date: r.date?.raw,
    })),
    offers: [
      ...(p.coupon ? [{
        type: "coupon" as const,
        label: p.coupon.text ?? p.coupon.badge_text ?? "Coupon available",
        discount: p.coupon.badge_text,
      }] : []),
      ...(p.deal ? [{
        type: "deal" as const,
        label: p.deal.badge_text ?? p.deal.type ?? "Deal",
      }] : []),
      ...(p.promotions?.map((promo) => ({
        type: "promo" as const,
        label: promo.raw ?? "Promotion",
      })) ?? []),
      ...(p.list_price?.value && price < p.list_price.value ? [{
        type: "sale" as const,
        label: `Save $${(p.list_price.value - price).toFixed(2)} (${Math.round(((p.list_price.value - price) / p.list_price.value) * 100)}% off)`,
        discount: `${Math.round(((p.list_price.value - price) / p.list_price.value) * 100)}%`,
      }] : []),
    ],
    fetchedAt: new Date().toISOString(),
  };
}

export function normalizeAmazonSearchResults(
  data: RainforestResponse
): import("./types").Product[] {
  return (data.search_results ?? []).map((item) => ({
    id: nanoid(),
    platform: "amazon" as const,
    platformId: item.asin ?? "",
    title: item.title ?? "Unknown",
    price: item.price?.value ?? 0,
    currency: item.price?.currency ?? "USD",
    url: item.link ?? `https://www.amazon.com/dp/${item.asin}`,
    images: item.image ? [{ url: item.image }] : [],
    rating: {
      average: item.rating ?? 0,
      count: item.ratings_total ?? 0,
    },
    brand: item.brand,
    specs: [],
    fetchedAt: new Date().toISOString(),
  }));
}
