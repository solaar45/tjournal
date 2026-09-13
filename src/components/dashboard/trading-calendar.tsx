"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  formatCurrency,
  formatSignedCurrency,
  getAmountColorClass,
  calculateDailyCalendarData,
  WeekCalendarRow,
  DayCalendarData,
} from '@/lib/tradeUtils';
import { Trade } from '@/types/trade';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, de } from 'date-fns/locale';

interface TradingCalendarProps {
  trades: Trade[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  locale: string;
}

export function TradingCalendar({
  trades,
  selectedDate,
  onSelectDate,
  locale,
}: TradingCalendarProps) {
  const { t, language } = useTranslation();
  const dateLocaleObj = language === 'de' ? de : enUS;

  // Track the currently displayed month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    // Default to month of most recent trade or current date
    if (trades.length > 0) {
      const latestTrade = trades[0];
      const d = new Date(latestTrade.exitDate || latestTrade.entryDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const nextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const monthLabel = format(currentMonthDate, 'MMMM yyyy', { locale: dateLocaleObj });
  const weeks = calculateDailyCalendarData(trades, currentMonthDate);

  const dayNames = language === 'de'
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs overflow-hidden">
      {/* Calendar Header */}
      <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight truncate">
            {t.calendar.title}
          </CardTitle>
          {selectedDate && (
            <Badge
              variant="secondary"
              className="text-xs font-mono gap-1 cursor-pointer hover:bg-rose-500/15 hover:text-[#FF647C] px-2 py-0.5 font-semibold"
              onClick={() => onSelectDate(null)}
              title={t.calendar.clearFilter}
            >
              <span>{selectedDate}</span>
              <X className="h-3.5 w-3.5" />
            </Badge>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-bold px-2 min-w-[90px] sm:min-w-[120px] text-center capitalize text-foreground">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden w-full">
        <div className="w-full">
          {/* Weekday column headers (Mo-Fr + Weekly) */}
          <div className="grid grid-cols-6 border-b border-border/60 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
            {dayNames.map((d, idx) => (
              <div key={idx} className="py-2.5 sm:py-3 border-r border-border/40 last:border-r-0">
                {d}
              </div>
            ))}
            <div className="py-2.5 sm:py-3 bg-muted/60 text-foreground font-bold">
              <span className="hidden sm:inline">{t.calendar.weekly}</span>
              <span className="sm:hidden">Σ</span>
            </div>
          </div>

          {/* Month grid rows (5 days + weekly = 6 cols) */}
          <div className="divide-y divide-border/40">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-6 min-h-[56px] sm:min-h-[72px]">
                {week.days.map((day, dIdx) => {
                  const isSelected = selectedDate === day.dateStr;
                  const hasTrades = day.tradesCount > 0;
                  const isPositive = day.pnl > 0;
                  const isNegative = day.pnl < 0;

                  return (
                    <div
                      key={dIdx}
                      onClick={() => {
                        if (hasTrades) {
                          onSelectDate(isSelected ? null : day.dateStr);
                        }
                      }}
                      className={`relative p-1.5 sm:p-2.5 border-r border-border/30 flex flex-col justify-between transition-all select-none min-w-0 ${
                        !day.isCurrentMonth ? 'opacity-30 bg-muted/10' : ''
                      } ${
                        hasTrades ? 'cursor-pointer hover:bg-muted/40' : ''
                      } ${
                        isSelected ? 'ring-2 ring-primary ring-inset bg-primary/10' : ''
                      } ${
                        hasTrades && isPositive ? 'hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30' : ''
                      } ${
                        hasTrades && isNegative ? 'hover:bg-rose-500/10 dark:hover:bg-rose-950/30' : ''
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className={`font-mono ${isSelected ? 'font-bold text-primary' : 'text-muted-foreground font-semibold'}`}>
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Day PnL & Trade Count */}
                      <div className="my-auto text-center py-0.5 min-w-0 overflow-hidden">
                        {hasTrades ? (
                          <>
                            <div
                              className={`text-xs sm:text-sm font-bold font-mono tracking-tight truncate ${getAmountColorClass(day.pnl)}`}
                            >
                              {formatSignedCurrency(day.pnl, locale)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono font-medium mt-0.5">
                              <span className="hidden sm:inline">
                                {day.tradesCount} {day.tradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                              </span>
                              <span className="sm:hidden font-bold">
                                {day.tradesCount}T
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="h-4 sm:h-6 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/40">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 6th Column: Weekly Total */}
                <div className="p-1.5 sm:p-2.5 bg-muted/30 flex flex-col justify-center items-center text-center min-w-0 overflow-hidden">
                  {week.weeklyTradesCount > 0 ? (
                    <>
                      <div
                        className={`text-xs sm:text-sm font-bold font-mono tracking-tight truncate ${getAmountColorClass(week.weeklyPnl)}`}
                      >
                        {formatSignedCurrency(week.weeklyPnl, locale)}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono font-medium mt-0.5">
                        <span className="hidden sm:inline">
                          {week.weeklyTradesCount} {week.weeklyTradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                        </span>
                        <span className="sm:hidden font-bold">
                          {week.weeklyTradesCount}T
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
