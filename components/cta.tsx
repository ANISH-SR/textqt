"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="relative py-24">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          <span className="block cursor-pointer transition-colors hover:text-accent">
            Ready to talk to your data?
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Join the beta and experience analytics that learns. 
          No credit card required. Set up in under 2 minutes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="group gap-2 px-8 font-medium">
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border/60 bg-transparent px-8 font-medium text-foreground hover:bg-secondary"
          >
            Book a demo
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Trusted by 500+ data teams worldwide
        </p>
      </div>
    </section>
  )
}
