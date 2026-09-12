"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  formatCurrency,
  formatSignedCurrency,
  formatTax,
  getAmountColorClass,
  getTaxColorClass,
} from '@/lib/tradeUtils';
import { Trade, TradeStats } from '@/types/trade';
import { StreakStats, LongShortStats } from '@/lib/tradeUtils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. WIN % CARD */}
      <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/60 hover:border-border transition-all flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
            <span>{t.kpi.winRate}</span>
            <span className="text-xs font-mono text-muted-foreground font-normal">
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
          <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden flex mb-2">
            <div
              style={{ width: `${winRate}%` }}
              className="bg-[#00C48C] h-full transition-all duration-500 rounded-l-full"
            />
            <div
              style={{ width: `${100 - winRate}%` }}
              className="bg-[#FF647C] h-full transition-all duration-500 rounded-r-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#00C48C] font-semibold">
              {winningTradesCount} {t.kpi.wins}
            </span>
            <span className="text-[#FF647C] font-semibold">
              {losingTradesCount} {t.kpi.losses}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. AVG WIN / LOSS CARD */}
      <Card className="p-4 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.avgWinLoss}
          </div>

          <div className={cn("text-2xl font-bold font-mono tracking-tight", getAmountColorClass(avgNetPerTrade))}>
            {formatSignedCurrency(avgNetPerTrade, locale)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t.kpi.perTrade}
          </div>
        </div>

        <div className="space-y-1.5 mt-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C48C]"></span>
              <span className="text-muted-foreground">Avg Win</span>
            </div>
            <span className="text-[#00C48C] font-semibold">
              +{formatCurrency(stats?.avgWin || 0, locale)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF647C]"></span>
              <span className="text-muted-foreground">Avg Loss</span>
            </div>
            <span className="text-[#FF647C] font-semibold">
              {stats?.avgLoss ? `-${formatCurrency(Math.abs(stats.avgLoss), locale)}` : formatCurrency(0, locale)}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. LONG VS SHORT CARD */}
      <Card className="p-4 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.longVsShort}
          </div>

          <div className={cn("text-2xl font-bold font-mono tracking-tight", getAmountColorClass(netPnL))}>
            {formatSignedCurrency(netPnL, locale)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t.kpi.totalPnL}
          </div>
        </div>

        <div className="space-y-1.5 mt-3 text-xs font-mono">
          {/* Long row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#D5F2EA] text-[#00C48C] dark:bg-[#122B24] dark:text-[#7DDFC3]">
                <ArrowUp className="h-3 w-3 stroke-[2.5]" />
              </span>
              <span className="text-muted-foreground">L ({longShortStats.long.count})</span>
            </div>
            <span className={cn("font-semibold", getAmountColorClass(longShortStats.long.pnl))}>
              {formatSignedCurrency(longShortStats.long.pnl, locale)}
            </span>
          </div>

          {/* Short row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FBE4E8] text-[#FF647C] dark:bg-[#33151D] dark:text-[#FDAFBB]">
                <ArrowDown className="h-3 w-3 stroke-[2.5]" />
              </span>
              <span className="text-muted-foreground">S ({longShortStats.short.count})</span>
            </div>
            <span className={cn("font-semibold", getAmountColorClass(longShortStats.short.pnl))}>
              {formatSignedCurrency(longShortStats.short.pnl, locale)}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. MAX STREAKS CARD */}
      <Card className="p-4 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.kpi.maxStreaks}
          </div>

          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {streakStats.bestWinStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t.kpi.bestWinStreak}
          </div>
        </div>

        <div className="space-y-1.5 mt-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.kpi.consecutiveWins}</span>
            <span className="text-[#00C48C] font-semibold">{streakStats.currentWinStreak}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.kpi.consecutiveLosses}</span>
            <span className="text-[#FF647C] font-semibold">{streakStats.maxLossStreak}</span>
          </div>
        </div>
      </Card>

      {/* 5. TOTAL TRADES & FEES CARD */}
      <Card className="p-4 bg-card border-border/70 hover:border-border hover:shadow-eggplore-card transition-all flex flex-col justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            TRADES & COSTS
          </div>

          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {stats?.totalTrades || 0}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats?.closedTrades || 0} {t.common.closed} · {stats?.openTrades || 0} {t.common.open}
          </div>
        </div>

        <div className="space-y-1.5 mt-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.common.fee}</span>
            <span className="font-semibold text-foreground">{formatCurrency(stats?.totalFees || 0, locale)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t.common.tax}</span>
            <span className={cn("font-semibold", getTaxColorClass(stats?.totalTax || 0))}>
              {formatTax(stats?.totalTax || 0, locale)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
