"use client";

import { useState, useEffect, useCallback } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useSaveSearch() {
  let convex: ReturnType<typeof useConvex> | null = null;
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convex = useConvex();
  } catch {
    // Convex not available
  }

  const saveSearch = useCallback(async (data: {
    sessionId: string;
    productName: string;
    originalUrl: string;
    originalPrice?: string;
    brand?: string;
    category?: string;
    alternatives: Array<{
      tier: "budget" | "mid" | "premium";
      name: string;
      price: string;
      source: string;
      url: string;
      savings?: string;
    }>;
  }) => {
    if (!convex) return null;
    try {
      return await convex.mutation(api.searches.saveSearch, data);
    } catch (e) {
      console.error("Failed to save search:", e);
      return null;
    }
  }, [convex]);

  return { saveSearch, isAvailable: !!convex };
}

export function useSearchHistory(sessionId: string | null) {
  let convex: ReturnType<typeof useConvex> | null = null;
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convex = useConvex();
  } catch {
    // Convex not available
  }

  const [history, setHistory] = useState<unknown[] | null>(null);
  const [stats, setStats] = useState<{ totalSearches: number; avgSavings: number; totalAlternatives: number } | null>(null);

  useEffect(() => {
    if (!convex || !sessionId) return;

    const fetchData = async () => {
      try {
        const [historyData, statsData] = await Promise.all([
          convex!.query(api.searches.getHistory, { sessionId }),
          convex!.query(api.searches.getStats, { sessionId }),
        ]);
        setHistory(historyData as unknown[]);
        setStats(statsData as { totalSearches: number; avgSavings: number; totalAlternatives: number });
      } catch (e) {
        console.error("Failed to fetch history:", e);
      }
    };

    fetchData();
  }, [convex, sessionId]);

  const clearHistory = useCallback(async () => {
    if (!convex || !sessionId) return;
    try {
      await convex.mutation(api.searches.clearHistory, { sessionId });
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  }, [convex, sessionId]);

  const deleteSearch = useCallback(async (id: string) => {
    if (!convex) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await convex.mutation(api.searches.deleteSearch, { id: id as any });
      setHistory((prev) => prev?.filter((item: unknown) => (item as { _id: string })._id !== id) || null);
    } catch (e) {
      console.error("Failed to delete search:", e);
    }
  }, [convex]);

  return { history, stats, clearHistory, deleteSearch, isAvailable: !!convex };
}
