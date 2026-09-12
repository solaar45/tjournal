"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTrades } from '@/hooks/useTrades';
import { Trade, TradeStats } from '@/types/trade';
import {
  calculateTradeStats,
  calculateStreakStats,
  calculateLongShortStats,
  calculateEquityCurve,
  StreakStats,
  LongShortStats,
  EquityPoint,
} from '@/lib/tradeUtils';

export type TimeframeFilter = 'all' | 'year' | 'month' | 'week' | 'today';

interface TradeFilterContextType {
  timeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
  assetType: string;
  setAssetType: (at: string) => void;
  selectedDate: string | null;
  setSelectedDate: (dateStr: string | null) => void;
  allTrades: Trade[];
  filteredTrades: Trade[];
  isLoading: boolean;
  dynamicStats: TradeStats;
  streakStats: StreakStats;
  longShortStats: LongShortStats;
  equityPoints: EquityPoint[];
  handleExportCsv: () => void;
}

const TradeFilterContext = createContext<TradeFilterContextType | undefined>(undefined);

export function TradeFilterProvider({ children }: { children: React.ReactNode }) {
  const { data: rawTrades, isLoading } = useTrades();

  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [assetType, setAssetType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTrades = useMemo(() => rawTrades || [], [rawTrades]);

  // Filtered Trades Logic
  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      // 1. Asset Type Filter
      if (assetType !== 'all' && trade.type !== assetType) {
        return false;
      }

      // 2. Calendar Specific Day Filter
      if (selectedDate) {
        const rawDate = trade.exitDate || trade.entryDate;
        if (!rawDate) return false;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return false;
        const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return dayStr === selectedDate;
      }

      // 3. Timeframe Filter
      if (timeframe !== 'all') {
        const rawDate = trade.exitDate || trade.entryDate;
        if (!rawDate) return false;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return false;
        const now = new Date();

        if (timeframe === 'today') {
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
          );
        }
        if (timeframe === 'week') {
          const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        if (timeframe === 'month') {
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }
        if (timeframe === 'year') {
          return d.getFullYear() === now.getFullYear();
        }
      }

      return true;
    });
  }, [allTrades, assetType, selectedDate, timeframe]);

  // Statistics
  const dynamicStats = useMemo(() => calculateTradeStats(filteredTrades), [filteredTrades]);
  const streakStats = useMemo(() => calculateStreakStats(filteredTrades), [filteredTrades]);
  const longShortStats = useMemo(() => calculateLongShortStats(filteredTrades), [filteredTrades]);
  const equityPoints = useMemo(() => calculateEquityCurve(filteredTrades), [filteredTrades]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredTrades.length === 0) return;
    const headers = [
      'Symbol',
      'Type',
      'Status',
      'Side',
      'Shares',
      'Entry Date',
      'Entry Price',
      'Exit Date',
      'Exit Price',
      'Fee',
      'Tax',
      'Net PnL',
      'Gross PnL',
      'PnL Percent',
    ];

    const rows = filteredTrades.map((t) => [
      t.symbol,
      t.type,
      t.status,
      t.side,
      t.entryShares || t.shares,
      t.entryDate ? new Date(t.entryDate).toISOString() : '',
      t.entryPrice || 0,
      t.exitDate ? new Date(t.exitDate).toISOString() : '',
      t.exitPrice || '',
      t.fee || 0,
      t.tax || 0,
      t.netPnl !== undefined ? t.netPnl : (t.pnl || 0),
      t.pnl || 0,
      t.pnlPercent || 0,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tjournal-trades-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TradeFilterContext.Provider
      value={{
        timeframe,
        setTimeframe,
        assetType,
        setAssetType,
        selectedDate,
        setSelectedDate,
        allTrades,
        filteredTrades,
        isLoading,
        dynamicStats,
        streakStats,
        longShortStats,
        equityPoints,
        handleExportCsv,
      }}
    >
      {children}
    </TradeFilterContext.Provider>
  );
}

export function useTradeFilters() {
  const context = useContext(TradeFilterContext);
  if (!context) {
    throw new Error('useTradeFilters must be used within a TradeFilterProvider');
  }
  return context;
}
