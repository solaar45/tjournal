"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { TradeFilterProvider } from '@/context/trade-filter-context';

/**
 * Global Providers für die App
 * 
 * Enthält:
 * - LanguageProvider: i18n Übersetzungen
 * - QueryClientProvider: TanStack Query für Server State Management
 * - TradeFilterProvider: Globaler Filter- & Trade-State für alle Seiten
 * - ReactQueryDevtools: DevTools für Entwicklung (nur im Dev-Modus sichtbar)
 * - Toaster: Sonner Notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TradeFilterProvider>
          {children}
        </TradeFilterProvider>
        <Toaster richColors position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </QueryClientProvider>
    </LanguageProvider>
  );
}
