"use client";

import React from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useTradeFilters } from '@/context/trade-filter-context';
import { FilterToolbar } from '@/components/dashboard/filter-toolbar';
import { KpiStrip } from '@/components/dashboard/kpi-strip';
import { SparklineCards } from '@/components/dashboard/sparkline-cards';

export default function AnalyticsPage() {
  const { locale, t } = useTranslation();
  const {
    dynamicStats,
    streakStats,
    longShortStats,
    equityPoints,
    isLoading,
  } = useTradeFilters();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-xs text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Universal Filter & Actions Header */}
      <FilterToolbar />


      {/* KPI Hero Cards Strip */}
      <KpiStrip
        stats={dynamicStats}
        streakStats={streakStats}
        longShortStats={longShortStats}
        locale={locale}
      />


      {/* Mini Sparklines: Daily Cumulative PnL & Drawdown */}
      <SparklineCards
        equityPoints={equityPoints}
        locale={locale}
      />
    </div>
  );
}
