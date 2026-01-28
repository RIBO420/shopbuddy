import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check if product is cached
export const getCachedProduct = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("productCache")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      return null;
    }

    return cached;
  },
});

// Cache a product
export const cacheProduct = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if already cached
    const existing = await ctx.db
      .query("productCache")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        ...args,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION_MS,
      });
      return existing._id;
    }

    // Create new cache entry
    const cacheId = await ctx.db.insert("productCache", {
      ...args,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    return cacheId;
  },
});

// Clean up expired cache entries (call periodically)
export const cleanupExpiredCache = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("productCache")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }

    return { deleted: expired.length };
  },
});
