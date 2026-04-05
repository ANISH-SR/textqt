"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Database,
  Brain,
  Shield,
  Zap,
  Users,
  LineChart,
  Layers,
  RefreshCw,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "HydraDB remembers your schema aliases, preferred charts, default filters, and business terminology across sessions.",
    highlight: true,
  },
  {
    icon: Database,
    title: "Zero Setup SQL",
    description: "Upload CSV, JSON, or SQLite files. DuckDB runs in-process with zero configuration needed.",
  },
  {
    icon: Zap,
    title: "Proactive Insights",
    description: "Before you ask, HydraDB surfaces trends and anomalies based on your query patterns.",
  },
  {
    icon: Users,
    title: "Multi-Tenant",
    description: "Memory is per-user and per-organization. Each team has its own dialect of your data.",
  },
  {
    icon: LineChart,
    title: "Smart Visualizations",
    description: "Auto-selects the right chart type based on data structure and your historical preferences.",
  },
  {
    icon: RefreshCw,
    title: "Self-Improving",
    description: "Correct an answer once, and HydraDB learns. It never makes the same mistake twice.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant, encrypted at rest and in transit. Your data never leaves your environment.",
  },
  {
    icon: Layers,
    title: "Flexible LLM Backend",
    description: "Works with Qwen, DeepSeek, GPT, or Claude. Bring your own model or use ours.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-accent/30 bg-accent/10 text-accent">
            Features
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="cursor-pointer transition-colors hover:text-accent">Built for data teams</span>
            <span className="block text-muted-foreground">who value their time</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`group relative border-border/40 bg-card/30 p-6 backdrop-blur transition-all hover:border-accent/30 hover:bg-card/50 ${
                feature.highlight ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <feature.icon
                className={`mb-4 h-6 w-6 text-accent transition-transform group-hover:scale-110 ${
                  feature.highlight ? "h-8 w-8" : ""
                }`}
              />
              <h3
                className={`mb-2 font-semibold text-foreground transition-colors group-hover:text-accent ${
                  feature.highlight ? "text-xl" : "text-lg"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`leading-relaxed text-muted-foreground ${
                  feature.highlight ? "text-base" : "text-sm"
                }`}
              >
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
