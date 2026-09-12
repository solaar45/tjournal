import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Trading Journal - Track & Optimize Your Trades",
  description: "Professional trading journal for logging, tracking, and analyzing financial trades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexMono.variable} ${inter.className} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                      <span className="font-bold">Trading Journal</span>
                    </Link>
                  </div>
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link
                      href="/"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/trades"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Trades
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <LanguageToggle />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8">{children}</main>

            {/* Footer */}
            <footer className="border-t py-6 md:py-0">
              <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with Next.js 15, TypeScript & TanStack Query
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
