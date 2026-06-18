import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Gestão de Atividades",
  description: "Ferramenta de gestão operacional para PMEs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900 pb-16 lg:pb-0">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  )
}
