"use client"

import { useEffect, useRef } from "react"

const logos = [
  { name: "Netflix", svg: "NETFLIX" },
  { name: "Stripe", svg: "stripe" },
  { name: "Shopify", svg: "shopify" },
  { name: "Slack", svg: "slack" },
  { name: "Notion", svg: "notion" },
  { name: "Linear", svg: "Linear" },
  { name: "Vercel", svg: "▲ Vercel" },
  { name: "Figma", svg: "figma" },
  { name: "GitHub", svg: "GitHub" },
  { name: "Airbnb", svg: "airbnb" },
]

export function LogoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPos = 0
    const speed = 0.5

    const scroll = () => {
      scrollPos += speed
      if (scrollPos >= scrollContainer.scrollWidth / 2) {
        scrollPos = 0
      }
      scrollContainer.scrollLeft = scrollPos
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent" />
      
      <div
        ref={scrollRef}
        className="flex gap-16 overflow-hidden whitespace-nowrap"
        style={{ scrollBehavior: "auto" }}
      >
        {/* Double the logos for seamless loop */}
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex shrink-0 items-center justify-center px-8 opacity-40 transition-opacity hover:opacity-70"
          >
            <span className="text-xl font-semibold tracking-wide text-foreground/80">
              {logo.svg}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
