"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "🔍",
      title: "Paste Any Link",
      description: "Drop a product link from any store and let ShopBuddy analyze it instantly.",
    },
    {
      icon: "💰",
      title: "Find Alternatives",
      description: "Get budget, mid-range, and premium alternatives with real comparisons.",
    },
    {
      icon: "⚡",
      title: "Instant Results",
      description: "AI-powered analysis delivers results in seconds, not minutes.",
    },
  ];

  const alternatives = [
    { tier: "Budget", emoji: "💰", color: "from-green-500 to-emerald-600", price: "€12.99", source: "AliExpress" },
    { tier: "Mid-Range", emoji: "💎", color: "from-blue-500 to-indigo-600", price: "€34.99", source: "Amazon" },
    { tier: "Premium", emoji: "👑", color: "from-purple-500 to-pink-600", price: "€89.99", source: "Official Store" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              ShopBuddy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/history">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                History
              </Button>
            </Link>
            <Link href="/chat">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Checking
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              ✨ Stop overpaying for products
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Check Before
            <span className="block bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              You Buy
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Paste any product link. Get instant alternatives at every price point. 
            Make smarter shopping decisions in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link href="/chat">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg animate-pulse-glow">
                Start Checking — It&apos;s Free
              </Button>
            </Link>
            <span className="text-muted-foreground text-sm">No sign-up required</span>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See it in action</h2>
            <p className="text-muted-foreground">Paste a link, get alternatives instantly</p>
          </div>

          {/* Mock Chat Interface */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-2xl">
            {/* Chat Messages */}
            <div className="space-y-4 mb-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-md">
                  <p className="text-sm break-all">https://www.coolblue.nl/product/912847/sony-wh-1000xm5.html</p>
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 max-w-lg">
                  <p className="text-sm mb-4">
                    🎧 <strong>Sony WH-1000XM5</strong> — Premium noise-canceling headphones
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">Found 3 alternatives for you:</p>
                  
                  {/* Alternatives Cards */}
                  <div className="space-y-3 stagger-children">
                    {alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-r ${alt.color} p-[1px] rounded-xl transition-transform hover:scale-[1.02]`}
                      >
                        <div className="bg-card rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{alt.emoji}</span>
                            <div>
                              <p className="font-medium text-sm">{alt.tier}</p>
                              <p className="text-xs text-muted-foreground">{alt.source}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{alt.price}</p>
                            {i === 0 && <p className="text-xs text-green-400">Save 85%</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <div className="flex-1 bg-secondary rounded-xl px-4 py-3 text-muted-foreground text-sm">
                Paste a product link...
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Three simple steps to smarter shopping</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border border-border bg-card transition-all duration-300 ${
                  hoveredFeature === i ? "scale-105 border-primary/50 shadow-lg shadow-primary/10" : ""
                }`}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to shop smarter?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of smart shoppers who check before they buy.
          </p>
          <Link href="/chat">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg">
              Start Checking Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-semibold">ShopBuddy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ShopBuddy. Made with ❤️ for smart shoppers.
          </p>
        </div>
      </footer>
    </div>
  );
}
