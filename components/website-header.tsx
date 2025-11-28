"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WebsiteHeaderProps {
  currentPage?: "home" | "about" | "pricing"
}

export function WebsiteHeader({ currentPage = "home" }: WebsiteHeaderProps) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // UPDATED: Increased threshold from 20 to 50 for a less "jumpy" start
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Fixed positioning wrapper to center the pill */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <header
          // UPDATED: Changed duration-300 to duration-1000 for a slow, gradual morph
          className={`transition-all duration-1000 ease-in-out flex items-center justify-between px-6 py-3 border ${
            scrolled
              ? "w-full max-w-2xl bg-[#050505]/80 backdrop-blur-xl border-white/10 shadow-lg rounded-full" // Scrolled: Compact Pill
              : "w-full max-w-5xl bg-transparent border-transparent rounded-full" // Top: Wider, transparent
          }`}
        >
          {/* 1. Left Section (Logo) */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
               <Image
                 src="/butterfly1000.png"
                 alt="TwinlyAI Logo"
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-blue-100 transition-colors">
              TwinlyAI
            </span>
          </Link>

          {/* 2. Centered Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/" active={currentPage === "home"}>Home</NavLink>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className={`text-sm font-medium transition-colors hover:text-white ${
                currentPage === "about" ? "text-white" : "text-gray-400"
              }`}
            >
              About
            </button>
            <NavLink href="/pricing" active={currentPage === "pricing"}>Pricing</NavLink>
          </nav>

          {/* 3. Action Buttons (Right) */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            <Link 
                href="/auth" 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
                Login
            </Link>
            <Button asChild size="sm" className="bg-white text-black hover:bg-gray-200 font-medium rounded-full px-6 transition-all hover:scale-105 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <Link href="/auth">Sign Up</Link>
            </Button>
          </div>

          {/* 4. Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* 5. Mobile Menu Dropdown */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute top-20 w-[90%] max-w-sm bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4 flex flex-col space-y-4"
                >
                    <nav className="flex flex-col space-y-2 text-center">
                        <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
                        <button 
                            onClick={() => { setIsAboutModalOpen(true); setIsMobileMenuOpen(false); }} 
                            className="block w-full py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            About
                        </button>
                        <MobileNavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</MobileNavLink>
                    </nav>
                    
                    <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                        <Link href="/auth" className="text-center text-gray-400 py-2" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                        <Button asChild className="w-full bg-white text-black hover:bg-gray-200 py-6 rounded-xl text-lg">
                            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* About Modal */}
      <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">About TwinlyAI</DialogTitle>
            <DialogDescription className="text-gray-400 text-base leading-relaxed mt-4">
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`text-sm font-medium transition-all duration-200 hover:text-white ${
                active ? "text-white" : "text-gray-400"
            }`}
        >
            {children}
        </Link>
    )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block w-full py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
            {children}
        </Link>
    )
}