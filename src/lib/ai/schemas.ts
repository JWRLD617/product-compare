import { z } from "zod";

export const insightsSchema = z.object({
  summary: z.string().describe("2-3 sentence overview of the comparison"),
  productAnalysis: z.array(
    z.object({
      platform: z.enum(["amazon", "ebay"]),
      pros: z.array(z.string()).describe("Key advantages of buying from this platform"),
      cons: z.array(z.string()).describe("Key disadvantages of buying from this platform"),
    })
  ),
  verdict: z.object({
    recommendation: z.enum(["amazon", "ebay", "either"]).describe("Which platform is recommended"),
    reasoning: z.string().describe("Why this platform is recommended"),
    bestFor: z.array(
      z.object({
        audience: z.string().describe("Type of buyer (e.g., 'Budget shoppers')"),
        platform: z.enum(["amazon", "ebay"]),
        reason: z.string(),
      })
    ),
  }),
  priceAnalysis: z.object({
    betterDeal: z.enum(["amazon", "ebay", "similar"]),
    savings: z.string().describe("Estimated savings amount or percentage"),
    fairness: z.string().describe("Is the price fair for this product category?"),
  }),
  buyingTips: z.array(z.string()).describe("1-3 actionable tips for the buyer"),
});

export type Insights = z.infer<typeof insightsSchema>;
