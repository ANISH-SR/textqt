import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductPreview } from "@/components/product-preview"
import { HowItWorks } from "@/components/how-it-works"
import { Features } from "@/components/features"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProductPreview />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </main>
  )
}
