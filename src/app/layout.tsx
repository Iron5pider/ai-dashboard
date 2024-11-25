import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/layout/Sidebar"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Dashboard",
  description: "Your personal AI learning hub",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background">
                <Header />
                <DashboardSidebar />
                <main className="pl-64">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

