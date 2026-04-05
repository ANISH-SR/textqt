"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { LogoCarousel } from "./logo-carousel"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16">
      {/* Subtle gradient orb */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Now in public beta
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Talk to your data.</span>
            <span className="mt-2 block text-accent">It remembers.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            The AI-powered analytics platform that learns your business language, 
            remembers your preferences, and delivers insights before you even ask.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="group gap-2 px-6 font-medium">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-border/60 bg-transparent px-6 font-medium text-foreground hover:bg-secondary"
            >
              <Play className="h-4 w-4" />
              Watch demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border/40 pt-8 md:grid-cols-4 md:gap-16">
            {[
              { value: "10x", label: "Faster insights" },
              { value: "98%", label: "Query accuracy" },
              { value: "0", label: "SQL needed" },
              { value: "24/7", label: "Memory active" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo carousel */}
        <div className="mt-20">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Trusted by data teams at
          </p>
          <LogoCarousel />
        </div>
      </div>
    </section>
  )
}
