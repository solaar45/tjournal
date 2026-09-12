"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
} from 'lucide-react';
import { Position, Transaction, TransactionType } from '@/types/position';
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatSignedPercent,
  getAmountColorClass,
} from '@/lib/tradeUtils';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PositionDetailCardProps {
  position: Position;
  onEdit?: (position: Position) => void;
  onAddTransaction?: (positionId: string) => void;
}

export function PositionDetailCard({
  position,
  onEdit,
  onAddTransaction,
}: PositionDetailCardProps) {
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  const dateFormat = language === 'de' ? 'dd.MM.yyyy' : 'MMM dd, yyyy';

  const entries = position.transactions.filter((t) => t.type === TransactionType.ENTRY);
  const exits = position.transactions.filter((t) => t.type === TransactionType.EXIT);

  const closedPercent = (position.totalExitShares / position.totalEntryShares) * 100;
  const openPercent = 100 - closedPercent;

  const isProfitable = position.totalPnL >= 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Master Row - Always Visible */}
      <CardContent className="p-0">
        <div
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Symbol & Side */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="font-bold text-lg">{position.symbol}</span>
            <Badge
              variant={position.side === 'Long' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {position.side === 'Long' ? t.common.long : t.common.short}
            </Badge>
          </div>

          {/* Avg Price */}
          <div className="flex flex-col min-w-[100px]">
            <span className="text-xs text-muted-foreground">{t.table.avgPrice}</span>
            <span className="font-medium">{formatCurrency(position.avgEntryPrice, locale)}</span>
          </div>

          {/* Shares */}
          <div className="flex flex-col min-w-[100px]">
            <span className="text-xs text-muted-foreground">{t.table.shares}</span>
            <span className="font-medium">
              {position.remainingShares} / {position.totalEntryShares} {language === 'de' ? 'Stk' : 'sh.'}
            </span>
          </div>

          {/* Status Badge */}
          <div className="min-w-[80px]">
            <Badge
              variant={
                position.status === 'OPEN'
                  ? 'blue'
                  : position.status === 'PARTIAL'
                  ? 'warning'
                  : 'secondary'
              }
              className="rounded-full px-2.5 py-0.5 font-semibold"
            >
              {position.status === 'OPEN'
                ? t.common.open
                : position.status === 'PARTIAL'
                ? (language === 'de' ? 'Teilweise' : 'Partial')
                : t.common.closed}
            </Badge>
          </div>

          {/* P/L */}
          <div className="flex flex-col items-end ml-auto min-w-[140px]">
            <div
              className={cn(
                'flex items-center gap-1 font-bold text-lg font-mono',
                getAmountColorClass(position.totalPnL)
              )}
            >
              {isProfitable ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatSignedCurrency(position.totalPnL, locale)}
            </div>
            <span
              className={cn(
                'text-sm font-mono',
                getAmountColorClass(position.totalPnLPercent)
              )}
            >
              {formatSignedPercent(position.totalPnLPercent)}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t bg-muted/30 p-4 space-y-6">
            {/* Position Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.common.status}</span>
                <span className="font-medium">
                  {position.remainingShares} {language === 'de' ? 'Stk offen' : 'shares open'} ({openPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                {position.totalExitShares > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${closedPercent}%` }}
                    title={`${closedPercent.toFixed(1)}% ${language === 'de' ? 'verkauft' : 'closed'}`}
                  />
                )}
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${openPercent}%` }}
                  title={`${openPercent.toFixed(1)}% ${language === 'de' ? 'offen' : 'open'}`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{position.totalExitShares} {language === 'de' ? 'Stk verkauft' : 'shares sold'}</span>
                <span>{position.remainingShares} {language === 'de' ? 'Stk offen' : 'shares open'}</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{language === 'de' ? 'Realisierter Gewinn' : 'Realized P&L'}</p>
                <p
                  className={cn(
                    'font-semibold text-lg font-mono',
                    getAmountColorClass(position.realizedPnL)
                  )}
                >
                  {formatSignedCurrency(position.realizedPnL, locale)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{language === 'de' ? 'Unrealisierter Gewinn' : 'Unrealized P&L'}</p>
                <p
                  className={cn(
                    'font-semibold text-lg font-mono',
                    getAmountColorClass(position.unrealizedPnL)
                  )}
                >
                  {formatSignedCurrency(position.unrealizedPnL, locale)}
                </p>
              </div>
            </div>

            {/* Entries Section */}
            {entries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-sm">{t.dashboard.entryGroup} ({entries.length})</h4>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-[80px]">
                          {format(new Date(entry.date), dateFormat, { locale: language === 'de' ? de : enUS })}
                        </span>
                        <span className="font-medium">{entry.shares} {language === 'de' ? 'Stk' : 'sh.'}</span>
                        <span className="text-sm">@ {formatCurrency(entry.price, locale)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          = {formatCurrency(entry.value, locale)}
                        </span>
                        <span className="text-xs text-muted-foreground w-[100px] text-right">
                          ø {formatCurrency(entry.positionAvgPrice, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800 text-sm font-semibold">
                    <span>{t.common.total}:</span>
                    <span>
                      {position.totalEntryShares} {language === 'de' ? 'Stk' : 'sh.'} @ Ø{' '}
                      {formatCurrency(position.avgEntryPrice, locale)} ={' '}
                      {formatCurrency(position.totalEntryValue, locale)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Exits Section */}
            {exits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4 text-[#00C48C]" />
                  <h4 className="font-semibold text-sm">{t.dashboard.exitGroup} ({exits.length})</h4>
                </div>
                <div className="space-y-2">
                  {exits.map((exit) => (
                    <div
                      key={exit.id}
                      className="flex items-center justify-between p-3 bg-[#D5F2EA]/25 dark:bg-[#122B24]/30 rounded-xl border border-[#00C48C]/20"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-[80px]">
                          {format(new Date(exit.date), dateFormat, { locale: language === 'de' ? de : enUS })}
                        </span>
                        <span className="font-medium">{exit.shares} {language === 'de' ? 'Stk' : 'sh.'}</span>
                        <span className="text-sm">@ {formatCurrency(exit.price, locale)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'font-semibold font-mono',
                            getAmountColorClass(exit.pnl ?? 0)
                          )}
                        >
                          {exit.pnl !== undefined ? formatSignedCurrency(exit.pnl, locale) : '-'}
                        </span>
                        <span
                          className={cn(
                            'text-xs w-[60px] text-right font-medium font-mono',
                            getAmountColorClass(exit.pnlPercent ?? 0)
                          )}
                        >
                          {exit.pnlPercent !== undefined ? formatSignedPercent(exit.pnlPercent) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {position.totalExitValue && (
                    <div className="flex justify-between pt-2 border-t border-border/70 text-sm font-semibold">
                      <span>{language === 'de' ? 'Realisiert:' : 'Realized:'}</span>
                      <span
                        className={cn(
                          'font-mono',
                          getAmountColorClass(position.realizedPnL)
                        )}
                      >
                        {formatSignedCurrency(position.realizedPnL, locale)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Open Position */}
            {position.remainingShares > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FFA26B]" />
                  <h4 className="font-semibold text-sm">{language === 'de' ? 'Offene Position' : 'Open Position'}</h4>
                </div>
                <div className="p-3 bg-[#FFE8DA]/30 dark:bg-[#311E16]/30 rounded-xl border border-[#FFA26B]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {position.remainingShares} {language === 'de' ? 'Stk' : 'sh.'} @ Ø <span className="font-mono">{formatCurrency(position.avgEntryPrice, locale)}</span>
                    </span>
                    <span
                      className={cn(
                        'font-semibold font-mono',
                        getAmountColorClass(position.unrealizedPnL)
                      )}
                    >
                      {formatSignedCurrency(position.unrealizedPnL, locale)} {language === 'de' ? '(aktueller Gewinn)' : '(current P&L)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(position)}
                >
                  {t.common.edit}
                </Button>
              )}
              {onAddTransaction && position.remainingShares > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddTransaction(position.id)}
                >
                  + {t.table.addTransaction}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
