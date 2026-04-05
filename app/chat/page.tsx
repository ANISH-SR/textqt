import { ChatInterface } from "@/components/chat-interface"
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              Sign Up
            </Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              Home
            </Link>
          </Button>
          <UserButton />
        </Show>
      </header>
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">TextQL + Memory</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your data and start asking questions with AI-powered memory
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  )
}
