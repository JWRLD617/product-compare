import { Product } from "../scrapers/types";

function formatProduct(product: Product, label: string): string {
  const parts = [
    `## ${label}`,
    `- **Title:** ${product.title}`,
    `- **Platform:** ${product.platform}`,
    `- **Price:** $${product.price.toFixed(2)} ${product.currency}`,
    `- **Rating:** ${product.rating.average}/5 (${product.rating.count} reviews)`,
  ];

  if (product.brand) parts.push(`- **Brand:** ${product.brand}`);
  if (product.condition) parts.push(`- **Condition:** ${product.condition}`);
  if (product.seller) {
    parts.push(`- **Seller:** ${product.seller.name}${product.seller.rating ? ` (${product.seller.rating}% positive)` : ""}`);
  }
  if (product.shippingCost !== undefined) {
    parts.push(`- **Shipping:** ${product.shippingCost === 0 ? "Free" : `$${product.shippingCost.toFixed(2)}`}`);
  }
  if (product.shippingInfo) parts.push(`- **Shipping Info:** ${product.shippingInfo}`);
  if (product.availability) parts.push(`- **Availability:** ${product.availability}`);

  if (product.specs.length > 0) {
    parts.push("\n### Specifications");
    for (const spec of product.specs.slice(0, 15)) {
      parts.push(`- ${spec.name}: ${spec.value}`);
    }
  }

  if (product.description) {
    parts.push(`\n### Description\n${product.description.slice(0, 500)}`);
  }

  return parts.join("\n");
}

export function buildComparisonPrompt(
  productA: Product,
  productB: Product
): string {
  return `You are a product comparison expert. Analyze these two product listings from different platforms and provide buying advice.

${formatProduct(productA, "Product A")}

${formatProduct(productB, "Product B")}

Compare these products and provide structured insights. Consider:
1. Price difference and total cost (including shipping)
2. Seller reliability and platform protections
3. Product condition and availability
4. Review quality and quantity
5. Return policies (Amazon generally has better returns than eBay)
6. Shipping speed and reliability

Be specific, actionable, and honest. If the products are not exactly the same, note any differences.`;
}
