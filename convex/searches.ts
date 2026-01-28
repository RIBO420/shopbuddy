import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get search history for a session
export const getHistory = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("searches")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(50);
    return searches;
  },
});

// Save a new search
export const saveSearch = mutation({
  args: {
    sessionId: v.string(),
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
  },
  handler: async (ctx, args) => {
    const searchId = await ctx.db.insert("searches", {
      ...args,
      savedAt: Date.now(),
    });
    return searchId;
  },
});

// Delete a search from history
export const deleteSearch = mutation({
  args: { id: v.id("searches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Clear all history for a session
export const clearHistory = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("searches")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    for (const search of searches) {
      await ctx.db.delete(search._id);
    }
  },
});

// Get stats for a session
export const getStats = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("searches")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    let totalSavings = 0;
    let savingsCount = 0;

    for (const search of searches) {
      const budgetAlt = search.alternatives.find((a) => a.tier === "budget");
      if (budgetAlt?.savings) {
        const savingsPercent = parseInt(budgetAlt.savings.replace(/[^0-9]/g, ""));
        if (!isNaN(savingsPercent)) {
          totalSavings += savingsPercent;
          savingsCount++;
        }
      }
    }

    return {
      totalSearches: searches.length,
      avgSavings: savingsCount > 0 ? Math.round(totalSavings / savingsCount) : 0,
      totalAlternatives: searches.reduce((acc, s) => acc + s.alternatives.length, 0),
    };
  },
});
