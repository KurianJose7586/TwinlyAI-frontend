import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { ColdStartLoader } from "@/components/ui/cold-start-loader";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";
// Import the generated skeleton registry
import "../bones/registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwinlyAI | Your Resume, Now Alive",
  description: "Transform static PDFs into interactive AI agents.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <LoadingProvider>
                <ToastProvider>
                  <CustomCursor />
                  <ColdStartLoader />
                  {children}
                </ToastProvider>
              </LoadingProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
