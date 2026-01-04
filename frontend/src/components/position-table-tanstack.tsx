"use client";

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ExpandedState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Edit,
  Plus,
  ArrowUpDown,
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

interface PositionTableTanstackProps {
  positions: Position[];
  onEdit?: (position: Position) => void;
  onAddTransaction?: (positionId: string) => void;
}

/**
 * Compact notation for large numbers
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
    return 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50';
  }
  if (type === TransactionType.EXIT) {
    if (pnl === undefined) return 'bg-gray-50 dark:bg-gray-900';
    return pnl >= 0
      ? 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50'
      : 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50';
  }
  return '';
}

/**
 * Main TanStack Position Table Component
 */
export function PositionTableTanstack({
  positions,
  onEdit,
  onAddTransaction,
}: PositionTableTanstackProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({}); // Empty = all collapsed

  // Define columns
  const columns = useMemo<ColumnDef<Position>[]>(
    () => [
      // Expand/Collapse Column
      {
        id: 'expander',
        header: '',
        size: 40,
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          );
        },
      },
      // Symbol Column
      {
        accessorKey: 'symbol',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8 text-xs"
          >
            Symbol
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold">{row.original.symbol}</span>,
      },
      // Side Column
      {
        id: 'side',
        accessorKey: 'side',
        header: 'Side',
        size: 70,
        cell: ({ row }) => (
          <Badge
            variant={row.original.side === 'Long' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {row.original.side === 'Long' ? '↑' : '↓'} {row.original.side}
          </Badge>
        ),
      },
      // Status Column
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 70,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'OPEN'
                ? 'default'
                : row.original.status === 'PARTIAL'
                ? 'outline'
                : 'secondary'
            }
            className="text-xs font-mono"
          >
            {row.original.status === 'OPEN'
              ? '[O]'
              : row.original.status === 'PARTIAL'
              ? '[P]'
              : '[C]'}
          </Badge>
        ),
      },
      // Price Column
      {
        id: 'avgPrice',
        accessorKey: 'avgEntryPrice',
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 text-xs"
            >
              Ø Price
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium text-sm">
            {formatCurrency(row.original.avgEntryPrice)}
          </div>
        ),
      },
      // Shares Column
      {
        id: 'shares',
        header: () => <div className="text-right">Shares</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">
            <span className="font-medium">{row.original.remainingShares}</span>
            <span className="text-muted-foreground">/{row.original.totalEntryShares}</span>
          </div>
        ),
      },
      // Entries Summary
      {
        id: 'entries',
        header: () => <div className="text-right">Entries</div>,
        cell: ({ row }) => {
          const entryCount = row.original.transactions.filter(
            (t) => t.type === TransactionType.ENTRY
          ).length;
          return (
            <div className="text-right text-xs text-muted-foreground">
              {entryCount}× {formatCompact(row.original.totalEntryValue)}
            </div>
          );
        },
      },
      // Exits Summary
      {
        id: 'exits',
        header: () => <div className="text-right">Exits</div>,
        cell: ({ row }) => {
          const exitCount = row.original.transactions.filter(
            (t) => t.type === TransactionType.EXIT
          ).length;
          return (
            <div className="text-right text-xs text-muted-foreground">
              {exitCount > 0
                ? `${exitCount}× ${formatCompact(row.original.totalExitValue || 0)}`
                : '-'}
            </div>
          );
        },
      },
      // Total P&L
      {
        id: 'pnl',
        accessorKey: 'totalPnL',
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 text-xs"
            >
              P/L
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const isProfitable = row.original.totalPnL >= 0;
          return (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                {isProfitable ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    'font-bold text-sm',
                    isProfitable ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCurrency(row.original.totalPnL)}
                </span>
              </div>
              <div
                className={cn(
                  'text-xs',
                  isProfitable ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatPercent(row.original.totalPnLPercent)}
              </div>
            </div>
          );
        },
      },
      // Actions Column
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        size: 90,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onAddTransaction && row.original.remainingShares > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTransaction(row.original.id);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onEdit, onAddTransaction]
  );

  const table = useReactTable({
    data: positions,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // CRITICAL: This enables expansion!
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="h-9 text-xs uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <>
                {/* Master Row */}
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => row.toggleExpanded()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Expanded Transaction Rows */}
                {row.getIsExpanded() &&
                  row.original.transactions.map((txn) => (
                    <TableRow
                      key={txn.id}
                      className={cn(
                        'border-l-4',
                        getTransactionRowBg(txn.type, txn.pnl)
                      )}
                    >
                      {/* Empty expander cell */}
                      <TableCell />

                      {/* Date */}
                      <TableCell className="py-1 pl-8 text-xs text-muted-foreground" colSpan={2}>
                        {format(new Date(txn.date), 'dd.MM.yy', { locale: de })}
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell className="py-1">
                        <Badge
                          variant={txn.type === TransactionType.ENTRY ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {txn.type === TransactionType.ENTRY ? 'Entry' : 'Exit'}
                        </Badge>
                      </TableCell>

                      {/* Price */}
                      <TableCell className="py-1 text-right text-xs font-mono">
                        {formatCurrency(txn.price)}
                      </TableCell>

                      {/* Shares */}
                      <TableCell className="py-1 text-right text-xs font-medium">
                        {txn.type === TransactionType.EXIT && '-'}
                        {txn.shares} Stk
                      </TableCell>

                      {/* Value */}
                      <TableCell className="py-1 text-right text-xs text-muted-foreground">
                        {formatCurrency(txn.value)}
                      </TableCell>

                      {/* P/L or empty */}
                      <TableCell className="py-1 text-right">
                        {txn.pnl !== undefined && (
                          <span
                            className={cn(
                              'font-semibold text-xs',
                              txn.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {formatCurrency(txn.pnl)}
                          </span>
                        )}
                      </TableCell>

                      {/* Avg Price After */}
                      <TableCell className="py-1 text-right text-xs text-muted-foreground">
                        Ø {formatCurrency(txn.positionAvgPrice)}
                      </TableCell>

                      {/* Empty actions cell */}
                      <TableCell />
                    </TableRow>
                  ))}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Positionen vorhanden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
