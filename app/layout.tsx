import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "./context/AuthContext"
import { CursorBackground } from "@/components/cursor-background"
import { BackgroundPattern } from "@/components/background-pattern"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react'; // <-- IMPORT aNALYTICS
import "./globals.css"

export const metadata: Metadata = {
  title: "TwinlyAI - Create a Personal Chatbot From Your Resume",
  description:
    "Upload your resume and get an intelligent AI assistant that knows your career history, ready to be embedded on your portfolio.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
    <link rel="icon" href="/favicon.ico" />
    <style>{`
        html {
          font-family: ${GeistSans.style.fontFamily};
          --font-sans: ${GeistSans.variable};
          --font-mono: ${GeistMono.variable};
        }
    `}</style>
</head>
      <body>
        <AuthProvider>
          <BackgroundPattern />
          <CursorBackground />
          <div className="relative z-10">{children}</div>
          <Toaster />
          <Analytics /> {/* <--- ADD THE ANALYTICS COMPONENT HERE */}
        </AuthProvider>
      </body>
    </html>
  )
}