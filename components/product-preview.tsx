"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Code2, BarChart3, Brain, ChevronRight, Sparkles } from "lucide-react"

const chatMessages = [
  { role: "user" as const, content: "Show me revenue by region" },
  { role: "assistant" as const, content: "Based on your preferences, I&apos;ll use a bar chart with last 30 days filter..." },
]

const sqlCode = `SELECT 
  region,
  SUM(orders.total - refunds.amount) as revenue
FROM sales
JOIN orders ON sales.order_id = orders.id
LEFT JOIN refunds ON orders.id = refunds.order_id
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY region
ORDER BY revenue DESC;`

const memoryItems = [
  { term: "revenue", definition: "orders.total - refunds.amount" },
  { term: "default_period", definition: "last 30 days" },
  { term: "preferred_chart", definition: "bar chart" },
  { term: "common_filters", definition: "region, product_type" },
]

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<"chat" | "sql" | "result" | "memory">("chat")

  return (
    <section id="product" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-accent/30 bg-accent/10 text-accent">
            Product
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="cursor-pointer transition-colors hover:text-accent">See it in action</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A complete data analytics interface that learns and adapts to your workflow.
          </p>
        </div>

        {/* Product Demo */}
        <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur">
          {/* Tabs */}
          <div className="flex border-b border-border/60">
            {[
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "sql", label: "SQL Preview", icon: Code2 },
              { id: "result", label: "Result", icon: BarChart3 },
              { id: "memory", label: "Memory", icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-accent bg-secondary/30 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[400px] p-6">
            {activeTab === "chat" && (
              <div className="space-y-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1 text-xs text-accent">
                          <Sparkles className="h-3 w-3" />
                          HydraDB
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-4">
                  <div className="flex-1 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-muted-foreground">
                    Type your question...
                  </div>
                  <button className="rounded-xl bg-accent px-4 py-3 text-accent-foreground transition-colors hover:bg-accent/90">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "sql" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  Generated SQL
                </div>
                <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-sm text-foreground">
                  <code>{sqlCode}</code>
                </pre>
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Sparkles className="h-3 w-3" />
                  Memory applied: revenue formula, 30-day default, bar chart preference
                </div>
              </div>
            )}

            {activeTab === "result" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue by Region</span>
                  <Badge variant="outline" className="text-xs">Last 30 days</Badge>
                </div>
                {/* Simplified chart visualization */}
                <div className="space-y-3">
                  {[
                    { region: "North America", value: 85, amount: "$2.4M" },
                    { region: "Europe", value: 65, amount: "$1.8M" },
                    { region: "Asia Pacific", value: 55, amount: "$1.5M" },
                    { region: "Latin America", value: 35, amount: "$980K" },
                  ].map((item) => (
                    <div key={item.region} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.region}</span>
                        <span className="font-medium text-foreground">{item.amount}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4" />
                  What HydraDB knows about your data
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {memoryItems.map((item) => (
                    <Card key={item.term} className="border-border/40 bg-secondary/30 p-4">
                      <div className="text-xs font-medium uppercase tracking-wide text-accent">
                        {item.term.replace("_", " ")}
                      </div>
                      <div className="mt-1 font-mono text-sm text-foreground">{item.definition}</div>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Memory is per-user and per-organization. Multi-tenant by design.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  )
}
