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
      <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#6979F8]" />
          <CardTitle className="text-sm font-semibold tracking-tight">
            {t.calendar.title}
          </CardTitle>
          {selectedDate && (
            <Badge
              variant="secondary"
              className="text-xs font-mono gap-1 cursor-pointer hover:bg-[#FF647C]/10 hover:text-[#FF647C]"
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
        <div className="min-w-[600px]">
          {/* Weekday column headers (Mo-Fr + Weekly) */}
          <div className="grid grid-cols-6 border-b border-border/60 bg-[#F7F5F9]/80 dark:bg-muted/30 text-xs font-semibold text-muted-foreground text-center">
            {dayNames.map((d, idx) => (
              <div key={idx} className="py-2.5 border-r border-border/40 last:border-r-0">
                {d}
              </div>
            ))}
            <div className="py-2.5 bg-muted/50 text-foreground font-bold">
              {t.calendar.weekly}
            </div>
          </div>

          {/* Month grid rows (5 days + weekly = 6 cols) */}
          <div className="divide-y divide-border/40">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-6 min-h-[68px]">
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
                      className={`relative p-2.5 border-r border-border/30 flex flex-col justify-between transition-all select-none ${
                        !day.isCurrentMonth ? 'opacity-30 bg-muted/10' : ''
                      } ${
                        hasTrades ? 'cursor-pointer hover:bg-muted/30' : ''
                      } ${
                        isSelected ? 'ring-2 ring-[#6979F8] ring-inset bg-[#E5E7FA]/40 dark:bg-[#1E1B38]/40' : ''
                      } ${
                        hasTrades && isPositive ? 'hover:bg-[#D5F2EA]/40 dark:hover:bg-[#122B24]/40' : ''
                      } ${
                        hasTrades && isNegative ? 'hover:bg-[#FBE4E8]/40 dark:hover:bg-[#33151D]/40' : ''
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-mono font-medium ${isSelected ? 'font-bold text-[#6979F8]' : 'text-muted-foreground'}`}>
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Day PnL & Trade Count */}
                      <div className="my-auto text-center py-0.5">
                        {hasTrades ? (
                          <>
                            <div
                              className={`text-sm font-bold font-mono tracking-tight ${getAmountColorClass(day.pnl)}`}
                            >
                              {formatSignedCurrency(day.pnl, locale)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {day.tradesCount} {day.tradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                            </div>
                          </>
                        ) : (
                          <div className="h-6 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/30">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 6th Column: Weekly Total */}
                <div className="p-2.5 bg-muted/20 flex flex-col justify-center items-center text-center">
                  {week.weeklyTradesCount > 0 ? (
                    <>
                      <div
                        className={`text-sm font-bold font-mono tracking-tight ${getAmountColorClass(week.weeklyPnl)}`}
                      >
                        {formatSignedCurrency(week.weeklyPnl, locale)}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {week.weeklyTradesCount} {week.weeklyTradesCount === 1 ? t.calendar.trade : t.calendar.trades}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/30">-</span>
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
