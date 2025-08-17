import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import { CursorBackground } from "@/components/cursor-background"
import { BackgroundPattern } from "@/components/background-pattern"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

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
    <html lang="en" className={`${geist.variable} ${manrope.variable} antialiased dark`}>
      <body>
        <BackgroundPattern />
        <CursorBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
