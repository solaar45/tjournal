import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Konfiguration
 * 
 * Diese Konfiguration optimiert das Caching und Fetching-Verhalten:
 * - staleTime: 5 Minuten - Daten gelten 5 Min als frisch (kein Refetch)
 * - gcTime: 10 Minuten - Ungenutzte Daten bleiben 10 Min im Cache
 * - refetchOnWindowFocus: false - Kein automatischer Refetch bei Tab-Wechsel
 * - retry: 1 - Nur ein Retry bei Fehler
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 Minuten
      gcTime: 1000 * 60 * 10, // 10 Minuten (vormals cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
