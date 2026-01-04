"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Edit,
  Plus,
} from 'lucide-react';
import { Position, Transaction, TransactionType } from '@/types/position';
import { formatCurrency, formatPercent } from '@/lib/tradeUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PositionTableProps {
  positions: Position[];
  onEdit?: (position: Position) => void;
  onAddTransaction?: (positionId: string) => void;
}

/**
 * Compact notation for large numbers
 * 27490 -> 27.5K
 * 1500000 -> 1.5M
 */
function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}

/**
 * Get background color for transaction rows
 */
function getTransactionRowBg(type: TransactionType, pnl?: number): string {
  if (type === TransactionType.ENTRY) {
    return 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/30';
  }
  if (type === TransactionType.EXIT) {
    if (pnl === undefined) return 'bg-gray-50 dark:bg-gray-900';
    return pnl >= 0
      ? 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50 dark:hover:bg-green-950/30'
      : 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30';
  }
  return '';
}

/**
 * Single Position Row with expandable transactions
 */
function PositionRow({
  position,
  onEdit,
  onAddTransaction,
}: {
  position: Position;
  onEdit?: (position: Position) => void;
  onAddTransaction?: (positionId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const entries = position.transactions.filter((t) => t.type === TransactionType.ENTRY);
  const exits = position.transactions.filter((t) => t.type === TransactionType.EXIT);

  const isProfitable = position.totalPnL >= 0;

  // Compact summary for entries/exits
  const entrySummary = `${entries.length}× ${formatCompact(position.totalEntryValue)}`;
  const exitSummary =
    exits.length > 0 ? `${exits.length}× ${formatCompact(position.totalExitValue || 0)}` : '-';

  return (
    <>
      {/* Master Row */}
      <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Expand Button */}
        <TableCell className="w-[40px] text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
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
        </TableCell>

        {/* Symbol */}
        <TableCell className="font-bold">{position.symbol}</TableCell>

        {/* Side */}
        <TableCell>
          <Badge variant={position.side === 'Long' ? 'default' : 'secondary'} className="text-xs">
            {position.side === 'Long' ? '↑' : '↓'} {position.side}
          </Badge>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Badge
            variant={
              position.status === 'OPEN'
                ? 'default'
                : position.status === 'PARTIAL'
                ? 'outline'
                : 'secondary'
            }
            className="text-xs"
          >
            {position.status === 'OPEN'
              ? '[O]'
              : position.status === 'PARTIAL'
              ? '[P]'
              : '[C]'}
          </Badge>
        </TableCell>

        {/* Avg Entry Price */}
        <TableCell className="text-right font-medium">
          {formatCurrency(position.avgEntryPrice)}
        </TableCell>

        {/* Position (Remaining/Total) */}
        <TableCell className="text-right">
          <span className="font-medium">{position.remainingShares}</span>
          <span className="text-muted-foreground">/{position.totalEntryShares}</span>
        </TableCell>

        {/* Entries Summary */}
        <TableCell className="text-right text-sm text-muted-foreground">
          {entrySummary}
        </TableCell>

        {/* Exits Summary */}
        <TableCell className="text-right text-sm text-muted-foreground">
          {exitSummary}
        </TableCell>

        {/* Total P/L */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {isProfitable ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                'font-bold',
                isProfitable ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(position.totalPnL)}
            </span>
          </div>
          <div
            className={cn(
              'text-xs',
              isProfitable ? 'text-green-600' : 'text-red-600'
            )}
          >
            {formatPercent(position.totalPnLPercent)}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(position);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onAddTransaction && position.remainingShares > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTransaction(position.id);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Transaction Rows */}
      {isExpanded &&
        position.transactions.map((txn) => (
          <TableRow
            key={txn.id}
            className={cn('border-l-4', getTransactionRowBg(txn.type, txn.pnl))}
          >
            {/* Empty expand column */}
            <TableCell />

            {/* Indented content for hierarchy */}
            <TableCell colSpan={2} className="pl-8 text-sm text-muted-foreground">
              {format(new Date(txn.date), 'dd.MM.yyyy', { locale: de })}
            </TableCell>

            {/* Transaction Type */}
            <TableCell>
              <Badge
                variant={txn.type === TransactionType.ENTRY ? 'default' : 'secondary'}
                className="text-xs"
              >
                {txn.type === TransactionType.ENTRY ? 'Entry' : 'Exit'}
              </Badge>
            </TableCell>

            {/* Price */}
            <TableCell className="text-right font-mono text-sm">
              {formatCurrency(txn.price)}
            </TableCell>

            {/* Shares */}
            <TableCell className="text-right font-medium">
              {txn.type === TransactionType.EXIT && '-'}
              {txn.shares} Stk
            </TableCell>

            {/* Value */}
            <TableCell className="text-right text-sm text-muted-foreground">
              {formatCurrency(txn.value)}
            </TableCell>

            {/* P/L (only for exits) */}
            <TableCell className="text-right">
              {txn.pnl !== undefined && (
                <span
                  className={cn(
                    'font-semibold text-sm',
                    txn.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(txn.pnl)}
                </span>
              )}
            </TableCell>

            {/* Avg Price After */}
            <TableCell className="text-right text-sm text-muted-foreground">
              Ø {formatCurrency(txn.positionAvgPrice)}
            </TableCell>

            {/* Empty actions column */}
            <TableCell />
          </TableRow>
        ))}
    </>
  );
}

/**
 * Main Position Table Component
 */
export function PositionTable({ positions, onEdit, onAddTransaction }: PositionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ø Entry</TableHead>
            <TableHead className="text-right">Position</TableHead>
            <TableHead className="text-right">Entries</TableHead>
            <TableHead className="text-right">Exits</TableHead>
            <TableHead className="text-right">P/L</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                Keine Positionen vorhanden
              </TableCell>
            </TableRow>
          ) : (
            positions.map((position) => (
              <PositionRow
                key={position.id}
                position={position}
                onEdit={onEdit}
                onAddTransaction={onAddTransaction}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
