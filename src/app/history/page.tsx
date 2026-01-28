"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import Link from "next/link";

interface Alternative {
  tier: "budget" | "mid" | "premium";
  name: string;
  price: string;
  source: string;
  url: string;
  savings?: string;
}

interface SearchItem {
  _id: string;
  productName: string;
  originalUrl: string;
  originalPrice?: string;
  category?: string;
  alternatives: Alternative[];
  savedAt: number;
}

interface Stats {
  totalSearches: number;
  avgSavings: number;
  totalAlternatives: number;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getCategoryEmoji(category?: string): string {
  const emojiMap: Record<string, string> = {
    electronics: "🎧",
    clothing: "👕",
    home: "🏠",
    sports: "⚽",
    beauty: "💄",
    food: "🍕",
    toys: "🎮",
    books: "📚",
  };
  return emojiMap[category?.toLowerCase() || ""] || "📦";
}

export default function HistoryPage() {
  const { sessionId } = useSession();
  
  const history = useQuery(
    api.searches.getHistory,
    sessionId ? { sessionId } : "skip"
  ) as SearchItem[] | undefined;
  
  const stats = useQuery(
    api.searches.getStats,
    sessionId ? { sessionId } : "skip"
  ) as Stats | undefined;
  
  const clearHistoryMutation = useMutation(api.searches.clearHistory);
  const deleteSearchMutation = useMutation(api.searches.deleteSearch);

  const handleClearHistory = async () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to clear all your search history?")) {
      await clearHistoryMutation({ sessionId });
    }
  };

  const handleDeleteSearch = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteSearchMutation({ id: id as any });
  };

  const isLoading = history === undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              ShopBuddy
            </span>
          </Link>
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              New Search
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Search History</h1>
            <p className="text-muted-foreground">Your recent product searches</p>
          </div>
          {history && history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 bg-card border-border">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && history && history.length === 0 && (
          <Card className="p-12 text-center bg-card border-border">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">No searches yet</h2>
            <p className="text-muted-foreground mb-6">
              Start checking products to see your history here
            </p>
            <Link href="/chat">
              <Button className="bg-primary hover:bg-primary/90">
                Start Searching
              </Button>
            </Link>
          </Card>
        )}

        {/* History list */}
        {!isLoading && history && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item: SearchItem, index: number) => {
              const budgetAlt = item.alternatives.find((a: Alternative) => a.tier === "budget");
              return (
                <Card
                  key={item._id}
                  className="p-4 bg-card border-border hover:border-primary/50 transition-all group animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Product Icon */}
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                      {getCategoryEmoji(item.category)}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.productName}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.originalUrl}
                      </p>
                    </div>

                    {/* Prices */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {item.originalPrice}
                          </span>
                        )}
                        {budgetAlt && (
                          <span className="font-bold text-primary">
                            {budgetAlt.price}
                          </span>
                        )}
                      </div>
                      {budgetAlt?.savings && (
                        <p className="text-xs text-green-400">{budgetAlt.savings}</p>
                      )}
                    </div>

                    {/* Time & Delete */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {formatTimeAgo(item.savedAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSearch(item._id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {!isLoading && stats && stats.totalSearches > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-12">
            <Card className="p-6 bg-card border-border text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalSearches}</p>
              <p className="text-sm text-muted-foreground">Products checked</p>
            </Card>
            <Card className="p-6 bg-card border-border text-center">
              <p className="text-3xl font-bold mb-1 text-primary">{stats.avgSavings}%</p>
              <p className="text-sm text-muted-foreground">Avg. savings</p>
            </Card>
            <Card className="p-6 bg-card border-border text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalAlternatives}</p>
              <p className="text-sm text-muted-foreground">Alternatives found</p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
