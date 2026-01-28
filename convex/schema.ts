import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Product searches history
  searches: defineTable({
    sessionId: v.string(), // Anonymous session ID (stored in localStorage)
    productName: v.string(),
    originalUrl: v.string(),
    originalPrice: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
    alternatives: v.array(
      v.object({
        tier: v.union(v.literal("budget"), v.literal("mid"), v.literal("premium")),
        name: v.string(),
        price: v.string(),
        source: v.string(),
        url: v.string(),
        savings: v.optional(v.string()),
      })
    ),
    savedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Cached product data (to avoid re-scraping)
  productCache: defineTable({
    url: v.string(),
    productName: v.string(),
    price: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
    alternatives: v.array(
      v.object({
        tier: v.union(v.literal("budget"), v.literal("mid"), v.literal("premium")),
        name: v.string(),
        price: v.string(),
        source: v.string(),
        url: v.string(),
        savings: v.optional(v.string()),
      })
    ),
    cachedAt: v.number(),
    expiresAt: v.number(),
  }).index("by_url", ["url"]),
});
