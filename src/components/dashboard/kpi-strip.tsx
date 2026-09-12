"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/lib/tradeUtils';
import { Trade, TradeStats } from '@/types/trade';
import { StreakStats, LongShortStats } from '@/lib/tradeUtils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KpiStripProps {
  stats?: TradeStats;
  streakStats: StreakStats;
  longShortStats: LongShortStats;
  locale: string;
}

export function KpiStrip({
  stats,
  streakStats,
  longShortStats,
  locale,
}: KpiStripProps) {
  const { t } = useTranslation();

  const totalClosed = stats?.closedTrades || 0;
  const winRate = stats?.winRate || 0;
  const winningTradesCount = Math.round((winRate / 100) * totalClosed);
  const losingTradesCount = Math.max(0, totalClosed - winningTradesCount);

  // Avg PnL per trade (net)
  const netPnL = stats?.totalNetPnL !== undefined ? stats.totalNetPnL : (stats?.totalPnL || 0);
  const avgNetPerTrade = totalClosed > 0 ? Number((netPnL / totalClosed).toFixed(2)) : 0;

  // Relative width calculation for Long vs Short bars
  const absLongPnl = Math.abs(longShortStats.long.pnl);
  const absShortPnl = Math.abs(longShortStats.short.pnl);
  const maxPnl = Math.max(absLongPnl, absShortPnl, 1);
  const longBarWidth = Math.min(100, Math.max(15, (absLongPnl / maxPnl) * 100));
  const shortBarWidth = Math.min(100, Math.max(15, (absShortPnl / maxPnl) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. WIN % CARD */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
            <span>{t.kpi.winRate}</span>
            <span className="text-[10px] font-mono text-muted-foreground font-normal">
              {winningTradesCount}W – {losingTradesCount}L
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {winRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div>
          {/* Two-tone split progress bar */}
          <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden flex mb-1.5">
            <div
              style={{ width: `${winRate}%` }}
              className="bg-emerald-500 h-full transition-all duration-500 rounded-l-full"
            />
            <div
              style={{ width: `${100 - winRate}%` }}
              className="bg-rose-500 h-full transition-all duration-500 rounded-r-full"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-500 font-medium">
              {winningTradesCount} {t.kpi.wins}
            </span>
            <span className="text-rose-500 font-medium">
              {losingTradesCount} {t.kpi.losses}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. AVG WIN / LOSS CARD */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.avgWinLoss}
          </div>

          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(avgNetPerTrade, locale)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t.kpi.perTrade}
          </div>
        </div>

        <div className="space-y-1 mt-2 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-muted-foreground">Avg Win</span>
            </div>
            <span className="text-emerald-500 font-medium">
              +{formatCurrency(stats?.avgWin || 0, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span className="text-muted-foreground">Avg Loss</span>
            </div>
            <span className="text-rose-500 font-medium">
              {stats?.avgLoss ? formatCurrency(stats.avgLoss, locale) : formatCurrency(0, locale)}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. LONG VS SHORT CARD */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.longVsShort}
          </div>

          <div className={`text-2xl font-bold font-mono tracking-tight ${
            netPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {netPnL >= 0 ? '+' : ''}{formatCurrency(netPnL, locale)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t.kpi.totalPnL}
          </div>
        </div>

        <div className="space-y-1.5 mt-2 text-[10px] font-mono">
          {/* Long row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-500/10 text-emerald-500">
                <ArrowUp className="h-2.5 w-2.5" />
              </span>
              <span className="text-muted-foreground">L ({longShortStats.long.count})</span>
            </div>
            <span className={longShortStats.long.pnl >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
              {longShortStats.long.pnl >= 0 ? '+' : ''}{formatCurrency(longShortStats.long.pnl, locale)}
            </span>
          </div>

          {/* Short row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-rose-500/10 text-rose-500">
                <ArrowDown className="h-2.5 w-2.5" />
              </span>
              <span className="text-muted-foreground">S ({longShortStats.short.count})</span>
            </div>
            <span className={longShortStats.short.pnl >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
              {longShortStats.short.pnl >= 0 ? '+' : ''}{formatCurrency(longShortStats.short.pnl, locale)}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. MAX STREAKS CARD */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.maxStreaks}
          </div>

          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {streakStats.bestWinStreak}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {t.kpi.bestWinStreak}
          </div>
        </div>

        <div className="space-y-1 mt-2 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.kpi.consecutiveWins}</span>
            <span className="text-emerald-500 font-medium">{streakStats.currentWinStreak}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.kpi.consecutiveLosses}</span>
            <span className="text-rose-500 font-medium">{streakStats.maxLossStreak}</span>
          </div>
        </div>
      </Card>

      {/* 5. TOTAL TRADES & FEES CARD */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            TRADES & COSTS
          </div>

          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {stats?.totalTrades || 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {stats?.closedTrades || 0} {t.common.closed} · {stats?.openTrades || 0} {t.common.open}
          </div>
        </div>

        <div className="space-y-1 mt-2 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.common.fee}</span>
            <span className="font-medium text-foreground">{formatCurrency(stats?.totalFees || 0, locale)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.common.tax}</span>
            <span className="font-medium text-foreground">{formatCurrency(stats?.totalTax || 0, locale)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
