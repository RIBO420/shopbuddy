"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import Link from "next/link";

// n8n Webhook URL - Direct call from frontend
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://ricardobos.app.n8n.cloud/webhook/shopbuddy-analyze";

interface Alternative {
  tier: "budget" | "mid" | "premium";
  name: string;
  price: string;
  source: string;
  url: string;
  savings?: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  product?: {
    name: string;
    originalPrice?: string;
    brand?: string;
    category?: string;
  };
  alternatives?: Alternative[];
  loading?: boolean;
}

const tierConfig = {
  budget: { emoji: "💰", label: "Budget", gradient: "from-green-500 to-emerald-600" },
  mid: { emoji: "💎", label: "Mid-Range", gradient: "from-blue-500 to-indigo-600" },
  premium: { emoji: "👑", label: "Premium", gradient: "from-purple-500 to-pink-600" },
};

export default function ChatPage() {
  const { sessionId } = useSession();
  const saveSearch = useMutation(api.searches.saveSearch);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hey! 👋 Paste any product link and I'll find you the best alternatives at every price point.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isValidUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const submittedUrl = input.trim();
    setInput("");

    if (!isValidUrl(submittedUrl)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "bot",
            content: "Please paste a valid product URL. I support links from most major stores like Amazon, Bol.com, Coolblue, and more!",
            timestamp: new Date(),
          },
        ]);
      }, 500);
      return;
    }

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        type: "bot",
        content: "",
        timestamp: new Date(),
        loading: true,
      },
    ]);
    setIsLoading(true);

    try {
      // Call n8n webhook directly
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: submittedUrl }),
      });

      const data = await response.json();

      // Save to Convex
      if (sessionId && data.product) {
        try {
          await saveSearch({
            sessionId,
            productName: data.product.name || "Unknown Product",
            originalUrl: submittedUrl,
            originalPrice: data.product.originalPrice,
            brand: data.product.brand,
            category: data.product.category,
            alternatives: data.alternatives || [],
          });
        } catch (e) {
          console.error("Failed to save search:", e);
        }
      }

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                loading: false,
                content: `Found alternatives for **${data.product?.name || "this product"}**:`,
                product: data.product,
                alternatives: data.alternatives,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Analyze error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                loading: false,
                content: "Sorry, I couldn't analyze that product. Please try again or check if the URL is correct.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              ShopBuddy
            </span>
          </Link>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              History
            </Button>
          </Link>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {message.type === "user" ? (
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-md">
                  <p className="text-sm break-all">{message.content}</p>
                </div>
              ) : (
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 max-w-lg">
                  {message.loading ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <p className="text-sm text-muted-foreground">Analyzing product...</p>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mb-4">{message.content}</p>
                      
                      {message.alternatives && message.alternatives.length > 0 && (
                        <div className="space-y-3">
                          {message.alternatives.map((alt, i) => {
                            const config = tierConfig[alt.tier];
                            return (
                              <a
                                key={i}
                                href={alt.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block bg-gradient-to-r ${config.gradient} p-[1px] rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg`}
                              >
                                <Card className="bg-card rounded-xl p-3 flex items-center justify-between border-0">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{config.emoji}</span>
                                    <div>
                                      <p className="font-medium text-sm">{config.label}</p>
                                      <p className="text-xs text-muted-foreground">{alt.source}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">{alt.price}</p>
                                    {alt.savings && (
                                      <p className="text-xs text-green-400">{alt.savings}</p>
                                    )}
                                  </div>
                                </Card>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-background pt-4 pb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a product link..."
              className="flex-1 bg-secondary border-0 h-12 px-4 rounded-xl focus-visible:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/90 h-12 px-6 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Supports Amazon, Bol.com, Coolblue, MediaMarkt, and 100+ more stores
          </p>
        </div>
      </main>
    </div>
  );
}
