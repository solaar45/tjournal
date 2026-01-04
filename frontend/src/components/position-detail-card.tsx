"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
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
import { formatCurrency, formatPercent } from '@/lib/tradeUtils';
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
  const [isExpanded, setIsExpanded] = useState(false);

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
              {position.side}
            </Badge>
          </div>

          {/* Avg Price */}
          <div className="flex flex-col min-w-[100px]">
            <span className="text-xs text-muted-foreground">Ø Einstieg</span>
            <span className="font-medium">{formatCurrency(position.avgEntryPrice)}</span>
          </div>

          {/* Shares */}
          <div className="flex flex-col min-w-[100px]">
            <span className="text-xs text-muted-foreground">Position</span>
            <span className="font-medium">
              {position.remainingShares} / {position.totalEntryShares} Stk
            </span>
          </div>

          {/* Status Badge */}
          <div className="min-w-[80px]">
            <Badge
              variant={
                position.status === 'OPEN'
                  ? 'default'
                  : position.status === 'PARTIAL'
                  ? 'outline'
                  : 'secondary'
              }
            >
              {position.status === 'OPEN'
                ? 'Offen'
                : position.status === 'PARTIAL'
                ? 'Teilweise'
                : 'Geschlossen'}
            </Badge>
          </div>

          {/* P/L */}
          <div className="flex flex-col items-end ml-auto min-w-[140px]">
            <div
              className={cn(
                'flex items-center gap-1 font-bold text-lg',
                isProfitable ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isProfitable ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatCurrency(position.totalPnL)}
            </div>
            <span
              className={cn(
                'text-sm',
                isProfitable ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatPercent(position.totalPnLPercent)}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t bg-muted/30 p-4 space-y-6">
            {/* Position Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Position Status</span>
                <span className="font-medium">
                  {position.remainingShares} Stk offen ({openPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                {position.totalExitShares > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${closedPercent}%` }}
                    title={`${closedPercent.toFixed(1)}% verkauft`}
                  />
                )}
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${openPercent}%` }}
                  title={`${openPercent.toFixed(1)}% offen`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{position.totalExitShares} Stk verkauft</span>
                <span>{position.remainingShares} Stk offen</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Realisierter Gewinn</p>
                <p
                  className={cn(
                    'font-semibold text-lg',
                    position.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(position.realizedPnL)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Unrealisierter Gewinn</p>
                <p
                  className={cn(
                    'font-semibold text-lg',
                    position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(position.unrealizedPnL)}
                </p>
              </div>
            </div>

            {/* Entries Section */}
            {entries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-sm">Einstiege ({entries.length})</h4>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-[80px]">
                          {format(new Date(entry.date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        <span className="font-medium">{entry.shares} Stk</span>
                        <span className="text-sm">@ {formatCurrency(entry.price)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          = {formatCurrency(entry.value)}
                        </span>
                        <span className="text-xs text-muted-foreground w-[100px] text-right">
                          Ø {formatCurrency(entry.positionAvgPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800 text-sm font-semibold">
                    <span>Gesamt:</span>
                    <span>
                      {position.totalEntryShares} Stk @ Ø{' '}
                      {formatCurrency(position.avgEntryPrice)} ={' '}
                      {formatCurrency(position.totalEntryValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Exits Section */}
            {exits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4 text-green-500" />
                  <h4 className="font-semibold text-sm">Ausstiege ({exits.length})</h4>
                </div>
                <div className="space-y-2">
                  {exits.map((exit) => (
                    <div
                      key={exit.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-[80px]">
                          {format(new Date(exit.date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        <span className="font-medium">{exit.shares} Stk</span>
                        <span className="text-sm">@ {formatCurrency(exit.price)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'font-semibold',
                            (exit.pnl ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {exit.pnl ? formatCurrency(exit.pnl) : '-'}
                        </span>
                        <span
                          className={cn(
                            'text-xs w-[60px] text-right font-medium',
                            (exit.pnlPercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {exit.pnlPercent ? formatPercent(exit.pnlPercent) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {position.totalExitValue && (
                    <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800 text-sm font-semibold">
                      <span>Realisiert:</span>
                      <span
                        className={cn(
                          position.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {formatCurrency(position.realizedPnL)}
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
                  <Activity className="h-4 w-4 text-amber-500" />
                  <h4 className="font-semibold text-sm">Offene Position</h4>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {position.remainingShares} Stk @ Ø {formatCurrency(position.avgEntryPrice)}
                    </span>
                    <span
                      className={cn(
                        'font-semibold',
                        position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(position.unrealizedPnL)} (aktueller Gewinn)
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
                  Bearbeiten
                </Button>
              )}
              {onAddTransaction && position.remainingShares > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddTransaction(position.id)}
                >
                  + Transaktion hinzufügen
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
