"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/lib/tradeUtils';
import { Trade } from '@/types/trade';
import { calculateDailyCalendarData, WeekCalendarRow, DayCalendarData } from '@/lib/tradeUtils';
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
    ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs overflow-hidden">
      {/* Calendar Header */}
      <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            {t.calendar.title}
          </CardTitle>
          {selectedDate && (
            <Badge
              variant="secondary"
              className="text-xs font-mono gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onSelectDate(null)}
              title={t.calendar.clearFilter}
            >
              <span>{selectedDate}</span>
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-semibold px-2 min-w-[110px] text-center capitalize">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Weekday column headers */}
          <div className="grid grid-cols-8 border-b border-border/40 bg-muted/40 text-[11px] font-semibold text-muted-foreground text-center">
            {dayNames.map((d, idx) => (
              <div key={idx} className="py-2 border-r border-border/30 last:border-r-0">
                {d}
              </div>
            ))}
            <div className="py-2 bg-muted/60 text-foreground font-bold">
              {t.calendar.weekly}
            </div>
          </div>

          {/* Month grid rows */}
          <div className="divide-y divide-border/40">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-8 min-h-[64px]">
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
                      className={`relative p-2 border-r border-border/30 flex flex-col justify-between transition-all select-none ${
                        !day.isCurrentMonth ? 'opacity-30 bg-muted/10' : ''
                      } ${
                        hasTrades ? 'cursor-pointer hover:bg-muted/30' : ''
                      } ${
                        isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''
                      } ${
                        hasTrades && isPositive ? 'hover:bg-emerald-500/5' : ''
                      } ${
                        hasTrades && isNegative ? 'hover:bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-mono ${isSelected ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Day PnL & Trade Count */}
                      <div className="my-auto text-center">
                        {hasTrades ? (
                          <>
                            <div
                              className={`text-xs font-bold font-mono tracking-tight ${
                                isPositive
                                  ? 'text-emerald-500'
                                  : isNegative
                                  ? 'text-rose-500'
                                  : 'text-foreground'
                              }`}
                            >
                              {isPositive ? '+' : ''}{formatCurrency(day.pnl, locale)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {day.tradesCount} {day.tradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                            </div>
                          </>
                        ) : (
                          <div className="h-6 flex items-center justify-center">
                            <span className="text-[11px] text-muted-foreground/30">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 8th Column: Weekly Total */}
                <div className="p-2 bg-muted/20 flex flex-col justify-center items-center text-center">
                  {week.weeklyTradesCount > 0 ? (
                    <>
                      <div
                        className={`text-xs font-bold font-mono tracking-tight ${
                          week.weeklyPnl > 0
                            ? 'text-emerald-500'
                            : week.weeklyPnl < 0
                            ? 'text-rose-500'
                            : 'text-foreground'
                        }`}
                      >
                        {week.weeklyPnl > 0 ? '+' : ''}{formatCurrency(week.weeklyPnl, locale)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {week.weeklyTradesCount} {week.weeklyTradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                      </div>
                    </>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/30">-</span>
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
