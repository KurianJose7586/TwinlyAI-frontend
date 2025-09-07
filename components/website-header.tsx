"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WebsiteHeaderProps {
  currentPage?: "home" | "about" | "pricing"
}

export function WebsiteHeader({ currentPage = "home" }: WebsiteHeaderProps) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="container flex h-16 items-center justify-between px-6">
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">TwinlyAI</span>
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                currentPage === "home" ? "text-blue-500" : "text-gray-300"
              }`}
            >
              Home
            </Link>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                currentPage === "about" ? "text-blue-500" : "text-gray-300"
              }`}
            >
              About
            </button>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                currentPage === "pricing" ? "text-blue-500" : "text-gray-300"
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Action Buttons (Right) */}
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-zinc-800">
              <Link href="/auth">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">About TwinlyAI</DialogTitle>
            <DialogDescription className="text-gray-300 text-base leading-relaxed mt-4">
              TwinlyAI transforms your resume into an intelligent AI assistant that can answer questions about your
              career, skills, and experience. Perfect for embedding on portfolios, personal websites, or sharing with
              potential employers.
              <br />
              <br />
              Built with cutting-edge AI technology, TwinlyAI makes your professional story accessible and interactive,
              helping you stand out in today's competitive job market.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}