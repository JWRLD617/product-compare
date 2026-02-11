export type Platform = "amazon" | "ebay";

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface ProductSeller {
  name: string;
  rating?: number;
  url?: string;
}

export interface ProductReview {
  title?: string;
  text: string;
  rating: number;
  author?: string;
  date?: string;
}

export interface ProductOffer {
  type: "coupon" | "deal" | "sale" | "promo";
  label: string;
  discount?: string;
}

export interface Product {
  id: string;
  platform: Platform;
  platformId: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  images: ProductImage[];
  rating: ProductRating;
  brand?: string;
  category?: string;
  description?: string;
  specs: ProductSpec[];
  seller?: ProductSeller;
  upc?: string;
  ean?: string;
  condition?: string;
  availability?: string;
  shippingCost?: number;
  shippingInfo?: string;
  reviews?: ProductReview[];
  offers?: ProductOffer[];
  listPrice?: number;
  fetchedAt: string;
}

export interface SearchResult {
  products: Product[];
  totalResults: number;
  query: string;
}

export interface MatchResult {
  product: Product;
  confidence: number;
  matchMethod: "upc" | "keyword" | "ai";
}

export interface ComparisonData {
  source: Product;
  matches: MatchResult[];
  selectedMatch?: MatchResult;
}
