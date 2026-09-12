"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/sonner';

/**
 * Global Providers für die App
 * 
 * Enthält:
 * - QueryClientProvider: TanStack Query für Server State Management
 * - ReactQueryDevtools: DevTools für Entwicklung (nur im Dev-Modus sichtbar)
 * - Toaster: Sonner Notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
