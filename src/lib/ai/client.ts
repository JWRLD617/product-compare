import Anthropic from "@anthropic-ai/sdk";
import { insightsSchema, type Insights } from "./schemas";
import { buildComparisonPrompt } from "./prompts";
import { Product } from "../scrapers/types";
import { cached, CACHE_TTL } from "../cache/redis";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  client = new Anthropic();
  return client;
}

export async function generateInsights(
  productA: Product,
  productB: Product
): Promise<Insights> {
  const cacheKey = `insights:${productA.platformId}:${productB.platformId}`;

  return cached(cacheKey, CACHE_TTL.INSIGHTS, async () => {
    const anthropic = getClient();
    const prompt = buildComparisonPrompt(productA, productB);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          name: "provide_insights",
          description: "Provide structured product comparison insights",
          input_schema: {
            type: "object" as const,
            properties: {
              summary: { type: "string", description: "2-3 sentence overview" },
              productAnalysis: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    platform: { type: "string", enum: ["amazon", "ebay"] },
                    pros: { type: "array", items: { type: "string" } },
                    cons: { type: "array", items: { type: "string" } },
                  },
                  required: ["platform", "pros", "cons"],
                },
              },
              verdict: {
                type: "object",
                properties: {
                  recommendation: { type: "string", enum: ["amazon", "ebay", "either"] },
                  reasoning: { type: "string" },
                  bestFor: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        audience: { type: "string" },
                        platform: { type: "string", enum: ["amazon", "ebay"] },
                        reason: { type: "string" },
                      },
                      required: ["audience", "platform", "reason"],
                    },
                  },
                },
                required: ["recommendation", "reasoning", "bestFor"],
              },
              priceAnalysis: {
                type: "object",
                properties: {
                  betterDeal: { type: "string", enum: ["amazon", "ebay", "similar"] },
                  savings: { type: "string" },
                  fairness: { type: "string" },
                },
                required: ["betterDeal", "savings", "fairness"],
              },
              buyingTips: { type: "array", items: { type: "string" } },
            },
            required: ["summary", "productAnalysis", "verdict", "priceAnalysis", "buyingTips"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "provide_insights" },
    });

    // Extract the tool use result
    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return structured insights");
    }

    const parsed = insightsSchema.parse(toolUse.input);
    return parsed;
  });
}
