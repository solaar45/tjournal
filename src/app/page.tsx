"use client";

import React, { useState, useMemo } from 'react';
import { useTrades, useTradeStats } from '@/hooks/useTrades';
import {
  formatCurrency,
  formatPercent,
  formatDateSafe,
  formatTax,
  formatSignedCurrency,
  formatSignedPercent,
  getAmountColorClass,
  getTaxColorClass,
  calculateTradeStats,
  calculateStreakStats,
  calculateLongShortStats,
  calculateEquityCurve,
} from '@/lib/tradeUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TradeForm } from '@/components/trade-form';
import { TradeType, TradeSide, Trade } from '@/types/trade';
import { useTranslation } from '@/i18n/LanguageContext';
import { ArrowUp, ArrowDown, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// New Dashboard Components inspired by TradeSync
import { FilterToolbar, TimeframeFilter } from '@/components/dashboard/filter-toolbar';
import { KpiStrip } from '@/components/dashboard/kpi-strip';
import { SparklineCards } from '@/components/dashboard/sparkline-cards';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';

export default function DashboardPage() {
  const { t, locale, language } = useTranslation();
  const { data: rawTrades, isLoading: tradesLoading, error: tradesError } = useTrades();

  // Filters State
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [assetType, setAssetType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTrades = rawTrades || [];

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

  // Dynamic Statistics based on filtered trades
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
    ];
    const rows = filteredTrades.map((tr) => [
      tr.symbol,
      tr.type,
      tr.status,
      tr.side,
      tr.entryShares || tr.shares,
      tr.entryDate || '',
      tr.entryPrice || 0,
      tr.exitDate || '',
      tr.exitPrice || '',
      tr.fee || 0,
      tr.tax || 0,
      tr.netPnl !== undefined ? tr.netPnl : (tr.pnl || 0),
      tr.pnl || 0,
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trades-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading State
  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-xs text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (tradesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive font-medium mb-1">Error loading data</p>
          <p className="text-xs text-muted-foreground">{tradesError.message}</p>
        </div>
      </div>
    );
  }

  // Display top 10 trades from current filter
  const displayedTrades = filteredTrades.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* 1. Quick Filter & Action Toolbar */}
      <FilterToolbar
        timeframe={timeframe}
        onTimeframeChange={(tf) => {
          setTimeframe(tf);
          setSelectedDate(null);
        }}
        assetType={assetType}
        onAssetTypeChange={(at) => {
          setAssetType(at);
          setSelectedDate(null);
        }}
        onExportCsv={filteredTrades.length > 0 ? handleExportCsv : undefined}
        filteredTradesCount={filteredTrades.length}
      />

      {/* 2. KPI Hero Cards Strip */}
      <KpiStrip
        stats={dynamicStats}
        streakStats={streakStats}
        longShortStats={longShortStats}
        locale={locale}
      />

      {/* 3. Mini Sparklines: Daily Cumulative PnL & Drawdown */}
      <SparklineCards
        equityPoints={equityPoints}
        locale={locale}
      />

      {/* 4. Trading Performance Calendar */}
      <TradingCalendar
        trades={allTrades.filter(t => assetType === 'all' || t.type === assetType)}
        selectedDate={selectedDate}
        onSelectDate={(dateStr) => setSelectedDate(dateStr)}
        locale={locale}
      />

      {/* 5. Trades Table */}
      <Card className="border-border/70 bg-card shadow-eggplore overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3.5 px-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-tight">
              {selectedDate ? (
                <span className="flex items-center gap-2">
                  <span>Trades for {selectedDate}</span>
                  <Badge variant="secondary" className="text-xs font-mono rounded-full">
                    {filteredTrades.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </span>
              ) : (
                t.dashboard.recentTrades
              )}
            </CardTitle>
          </div>
          <Link href="/trades">
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-8 text-muted-foreground hover:text-foreground">
              <span>{t.common.trades}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {displayedTrades.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-muted-foreground mb-3">{t.dashboard.noTradesYet}</p>
              <TradeForm trigger={<Button size="sm" className="text-xs">{t.dashboard.createFirstTrade}</Button>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F5F9]/80 dark:bg-muted/30 border-b border-border/60 text-xs">
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.symbol}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.type}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.status}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider text-center">{t.common.side}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.shares}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.dashboard.entryGroup} {t.common.date}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.dashboard.entryGroup} {t.common.price}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.dashboard.exitGroup} {t.common.date}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.dashboard.exitGroup} {t.common.price}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.fee}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">{t.common.tax}</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">Net P&L</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider text-right">Gross P&L (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTrades.map((trade) => {
                    const netPnl = trade.netPnl !== undefined ? trade.netPnl : trade.pnl;
                    const isClosed = trade.status === 'closed';

                    return (
                      <TableRow key={trade.id} className="text-xs hover:bg-[#F7F5F9]/80 dark:hover:bg-muted/30 transition-colors">
                        {/* Information */}
                        <TableCell className="font-bold text-foreground">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full font-medium">{trade.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={trade.status === 'open' ? 'blue' : 'secondary'}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                          >
                            {trade.status === 'open' ? t.common.open : t.common.closed}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {trade.side === TradeSide.LONG || (trade.side as string) === 'Long' ? (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#D5F2EA] text-[#00C48C] dark:bg-[#122B24] dark:text-[#7DDFC3]"
                              title="Long"
                            >
                              <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FBE4E8] text-[#FF647C] dark:bg-[#33151D] dark:text-[#FDAFBB]"
                              title="Short"
                            >
                              <ArrowDown className="h-3 w-3 stroke-[2.5]" />
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{trade.entryShares || trade.shares}</TableCell>

                        {/* Entry */}
                        <TableCell className="text-muted-foreground">
                          {formatDateSafe(trade.entryDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatCurrency(trade.entryPrice, locale)}
                        </TableCell>

                        {/* Exit */}
                        <TableCell className="text-muted-foreground">
                          {formatDateSafe(trade.exitDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-mono">
                          {trade.exitPrice
                            ? formatCurrency(trade.exitPrice, locale)
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>

                        {/* Costs & Tax */}
                        <TableCell className="font-mono">
                          {formatCurrency(trade.fee || 0, locale)}
                        </TableCell>
                        <TableCell className={cn("font-mono font-medium", getTaxColorClass(trade.tax))}>
                          {formatTax(trade.tax, locale)}
                        </TableCell>

                        {/* Return */}
                        <TableCell>
                          {isClosed && netPnl !== undefined ? (
                            <div className={cn("font-bold font-mono", getAmountColorClass(netPnl))}>
                              {formatSignedCurrency(netPnl, locale)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {isClosed && trade.pnl !== undefined ? (
                            <div>
                              <span className={cn("font-medium", getAmountColorClass(trade.pnl))}>
                                {formatSignedCurrency(trade.pnl, locale)}
                              </span>
                              {trade.pnlPercent !== undefined && (
                                <span className={cn("ml-1 text-[11px]", getAmountColorClass(trade.pnlPercent))}>
                                  ({formatSignedPercent(trade.pnlPercent, locale)})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
