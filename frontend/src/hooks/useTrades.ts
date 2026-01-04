import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trade, CreateTradeDto, UpdateTradeDto, TradeStats } from '@/types/trade';
import { toast } from 'sonner';

/**
 * API Base URL (könnte später aus Env-Variable kommen)
 */
const API_BASE = '/api';

/**
 * Query Keys für konsistentes Caching
 */
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters?: { status?: string; type?: string }) => 
    [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  stats: () => [...tradeKeys.all, 'stats'] as const,
};

/**
 * Hook: Alle Trades abrufen (mit optionalen Filtern)
 */
export function useTrades(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: async (): Promise<Trade[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);

      const url = `${API_BASE}/trades${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Fehler beim Laden der Trades');
      }
      
      return res.json();
    },
  });
}

/**
 * Hook: Einzelnen Trade abrufen
 */
export function useTrade(id: string) {
  return useQuery({
    queryKey: tradeKeys.detail(id),
    queryFn: async (): Promise<Trade> => {
      const res = await fetch(`${API_BASE}/trades/${id}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Trade nicht gefunden');
        }
        throw new Error('Fehler beim Laden des Trades');
      }
      
      return res.json();
    },
    enabled: !!id, // Nur fetchen wenn ID vorhanden
  });
}

/**
 * Hook: Trade-Statistiken abrufen
 */
export function useTradeStats() {
  return useQuery({
    queryKey: tradeKeys.stats(),
    queryFn: async (): Promise<TradeStats> => {
      const res = await fetch(`${API_BASE}/trades/stats`);
      
      if (!res.ok) {
        throw new Error('Fehler beim Laden der Statistiken');
      }
      
      return res.json();
    },
  });
}

/**
 * Hook: Neuen Trade erstellen
 */
export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTrade: CreateTradeDto): Promise<Trade> => {
      const res = await fetch(`${API_BASE}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrade),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Trades');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Cache invalidieren -> automatisches Refetch
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tradeKeys.stats() });
      
      // Optimistic Update: Neuen Trade direkt in Cache schreiben
      queryClient.setQueryData(tradeKeys.detail(data.id), data);
      
      toast.success('Trade erfolgreich erstellt!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen des Trades');
    },
  });
}

/**
 * Hook: Trade aktualisieren
 */
export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: UpdateTradeDto & { id: string }): Promise<Trade> => {
      const res = await fetch(`${API_BASE}/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren des Trades');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tradeKeys.stats() });
      
      // Spezifischen Trade im Cache aktualisieren
      queryClient.setQueryData(tradeKeys.detail(variables.id), data);
      
      toast.success('Trade erfolgreich aktualisiert!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren des Trades');
    },
  });
}

/**
 * Hook: Trade löschen
 */
export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/trades/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Fehler beim Löschen des Trades');
      }
    },
    onSuccess: (_, id) => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tradeKeys.stats() });
      
      // Gelöschten Trade aus Cache entfernen
      queryClient.removeQueries({ queryKey: tradeKeys.detail(id) });
      
      toast.success('Trade erfolgreich gelöscht!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Löschen des Trades');
    },
  });
}

/**
 * Hook: Trade schließen (Convenience-Wrapper für useUpdateTrade)
 */
export function useCloseTrade() {
  const updateTrade = useUpdateTrade();

  return {
    ...updateTrade,
    mutate: (tradeId: string, exitPrice: number, exitDate?: string) => {
      updateTrade.mutate({
        id: tradeId,
        status: 'closed' as any,
        exitPrice,
        exitDate: exitDate || new Date().toISOString(),
      });
    },
  };
}
