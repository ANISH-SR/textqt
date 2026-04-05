"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Chat", href: "/chat" },
]

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Database className="h-6 w-6 text-accent" />
          <div className="text-xl font-bold">TextQt</div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="font-medium">
                Get Started
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/chat">
                Go to Chat
              </Link>
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
