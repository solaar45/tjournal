import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutHeader } from "@/components/layout-header";

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
  title: "tjournal - Professional Trading Journal",
  description: "Track, analyze, and optimize your trades with the Eggplore design system",
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
          <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-[#E5E7FA] selection:text-[#6979F8]">
            {/* Header */}
            <LayoutHeader />

            {/* Main Content */}
            <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/70 py-6 bg-card/40 backdrop-blur-xs">
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C48C] animate-pulse" />
                  <span>tjournal · Eggplore UI Edition</span>
                </div>
                <p>
                  Built with Next.js, TypeScript, TanStack Query & Tailwind CSS
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
