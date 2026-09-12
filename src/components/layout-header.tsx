"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageToggle } from '@/components/language-toggle';
import { TrendingUp, Layers, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageContext';

export function LayoutHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isTrades = pathname === '/trades' || pathname === '/';
  const isCalendar = pathname.startsWith('/calendar');
  const isAnalytics = pathname.startsWith('/analytics');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex h-16 items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/trades" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-eggplore flex items-center justify-center text-white shadow-sm shadow-[#6979F8]/25 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground">tjournal</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-[#E5E7FA] text-[#6979F8] dark:bg-[#2A1E38] dark:text-[#A5AFFB]">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:inline">
                Eggplore Edition
              </span>
            </div>
          </Link>

          {/* Nav: Eggplore Pill Segmented Tabs */}
          <nav className="flex items-center p-1 bg-muted/80 dark:bg-muted/40 rounded-full border border-border/50 text-xs font-semibold">
            <Link
              href="/trades"
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150",
                isTrades
                  ? "bg-card text-foreground shadow-xs shadow-black/5 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Trades</span>
            </Link>
            <Link
              href="/calendar"
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150",
                isCalendar
                  ? "bg-card text-foreground shadow-xs shadow-black/5 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </Link>
            <Link
              href="/analytics"
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-150",
                isAnalytics
                  ? "bg-card text-foreground shadow-xs shadow-black/5 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
