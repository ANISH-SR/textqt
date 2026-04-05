"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Upload, MessageSquare, Brain, Zap } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your data",
    description: "Drop in any CSV, JSON, or SQLite file. No complex setup, no database configuration. Just your data.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Ask questions naturally",
    description: "Type questions in plain English. HydraDB translates your intent into precise SQL queries automatically.",
  },
  {
    step: "03",
    icon: Brain,
    title: "Memory learns & adapts",
    description: "Every interaction teaches HydraDB your terminology, preferences, and common patterns. It gets smarter with you.",
  },
  {
    step: "04",
    icon: Zap,
    title: "Get proactive insights",
    description: "Before you even ask, HydraDB surfaces relevant insights based on your history and patterns.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 border-accent/30 bg-accent/10 text-accent">
            How It Works
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="cursor-pointer transition-colors hover:text-accent">From zero to insights</span>
            <span className="block text-muted-foreground">in minutes, not months</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <Card
              key={item.step}
              className="group relative border-border/40 bg-card/30 p-6 backdrop-blur transition-all hover:border-accent/30 hover:bg-card/50"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border/60 lg:block" />
              )}
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{item.step}</span>
                <item.icon className="h-5 w-5 text-accent transition-transform group-hover:scale-110" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
