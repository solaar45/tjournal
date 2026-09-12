"use client";

import React from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useTradeFilters } from '@/context/trade-filter-context';
import { FilterToolbar } from '@/components/dashboard/filter-toolbar';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';

export default function CalendarPage() {
  const { locale, t } = useTranslation();
  const { allTrades, assetType, selectedDate, setSelectedDate, isLoading } = useTradeFilters();

  const calendarTrades = React.useMemo(() => {
    return allTrades.filter((tr) => assetType === 'all' || tr.type === assetType);
  }, [allTrades, assetType]);

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


      {/* Calendar Only */}
      <TradingCalendar
        trades={calendarTrades}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        locale={locale}
      />
    </div>
  );
}
