"use client";

import { useMemo } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Row,
  SortingState,
  ExpandedState,
} from '@tanstack/react-table';
import { useState } from 'react';
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
 * Flattened row type for TanStack Table
 */
type TableRow = {
  id: string;
  type: 'position' | 'transaction';
  position?: Position;
  transaction?: Transaction;
  parentId?: string;
};

/**
 * Main TanStack Position Table Component
 */
export function PositionTableTanstack({
  positions,
  onEdit,
  onAddTransaction,
}: PositionTableTanstackProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Flatten data: Position rows + their transaction sub-rows
  const data = useMemo<TableRow[]>(() => {
    const rows: TableRow[] = [];
    positions.forEach((position) => {
      // Add position master row
      rows.push({
        id: position.id,
        type: 'position',
        position,
      });
      
      // Add transaction sub-rows
      position.transactions.forEach((transaction) => {
        rows.push({
          id: transaction.id,
          type: 'transaction',
          transaction,
          parentId: position.id,
        });
      });
    });
    return rows;
  }, [positions]);

  // Define columns
  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      // Expand/Collapse Column
      {
        id: 'expander',
        header: '',
        size: 40,
        cell: ({ row }) => {
          if (row.original.type !== 'position') return null;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => row.toggleExpanded()}
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
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            return <span className="font-bold">{position.symbol}</span>;
          }
          if (type === 'transaction' && transaction) {
            return (
              <span className="text-xs text-muted-foreground pl-4">
                {format(new Date(transaction.date), 'dd.MM.yy', { locale: de })}
              </span>
            );
          }
          return null;
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.position?.symbol || '';
          const b = rowB.original.position?.symbol || '';
          return a.localeCompare(b);
        },
      },
      // Side / Type Column
      {
        id: 'sideType',
        header: 'Side',
        size: 70,
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            return (
              <Badge
                variant={position.side === 'Long' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {position.side === 'Long' ? '↑' : '↓'} {position.side}
              </Badge>
            );
          }
          if (type === 'transaction' && transaction) {
            return (
              <Badge
                variant={transaction.type === TransactionType.ENTRY ? 'default' : 'secondary'}
                className="text-xs"
              >
                {transaction.type === TransactionType.ENTRY ? 'Entry' : 'Exit'}
              </Badge>
            );
          }
          return null;
        },
      },
      // Status Column
      {
        id: 'status',
        header: 'Status',
        size: 70,
        cell: ({ row }) => {
          const { type, position } = row.original;
          if (type !== 'position' || !position) return null;
          return (
            <Badge
              variant={
                position.status === 'OPEN'
                  ? 'default'
                  : position.status === 'PARTIAL'
                  ? 'outline'
                  : 'secondary'
              }
              className="text-xs font-mono"
            >
              {position.status === 'OPEN' ? '[O]' : position.status === 'PARTIAL' ? '[P]' : '[C]'}
            </Badge>
          );
        },
      },
      // Price Column
      {
        id: 'price',
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
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            return (
              <div className="text-right font-medium text-sm">
                {formatCurrency(position.avgEntryPrice)}
              </div>
            );
          }
          if (type === 'transaction' && transaction) {
            return (
              <div className="text-right text-xs font-mono">
                {formatCurrency(transaction.price)}
              </div>
            );
          }
          return null;
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.position?.avgEntryPrice || 0;
          const b = rowB.original.position?.avgEntryPrice || 0;
          return a - b;
        },
      },
      // Shares Column
      {
        id: 'shares',
        header: () => <div className="text-right">Shares</div>,
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            return (
              <div className="text-right text-sm">
                <span className="font-medium">{position.remainingShares}</span>
                <span className="text-muted-foreground">/{position.totalEntryShares}</span>
              </div>
            );
          }
          if (type === 'transaction' && transaction) {
            return (
              <div className="text-right text-xs">
                {transaction.type === TransactionType.EXIT && '-'}
                {transaction.shares} Stk
              </div>
            );
          }
          return null;
        },
      },
      // Entries Summary
      {
        id: 'entries',
        header: () => <div className="text-right">Entries</div>,
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            const entryCount = position.transactions.filter(
              (t) => t.type === TransactionType.ENTRY
            ).length;
            return (
              <div className="text-right text-xs text-muted-foreground">
                {entryCount}× {formatCompact(position.totalEntryValue)}
              </div>
            );
          }
          if (type === 'transaction' && transaction) {
            return (
              <div className="text-right text-xs text-muted-foreground">
                {formatCurrency(transaction.value)}
              </div>
            );
          }
          return null;
        },
      },
      // Exits Summary / P&L
      {
        id: 'exits',
        header: () => <div className="text-right">Exits</div>,
        cell: ({ row }) => {
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            const exitCount = position.transactions.filter(
              (t) => t.type === TransactionType.EXIT
            ).length;
            return (
              <div className="text-right text-xs text-muted-foreground">
                {exitCount > 0 ? `${exitCount}× ${formatCompact(position.totalExitValue || 0)}` : '-'}
              </div>
            );
          }
          if (type === 'transaction' && transaction && transaction.pnl !== undefined) {
            return (
              <div
                className={cn(
                  'text-right text-xs font-semibold',
                  transaction.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {formatCurrency(transaction.pnl)}
              </div>
            );
          }
          return null;
        },
      },
      // Total P&L
      {
        id: 'pnl',
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
          const { type, position, transaction } = row.original;
          if (type === 'position' && position) {
            const isProfitable = position.totalPnL >= 0;
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
              </div>
            );
          }
          if (type === 'transaction' && transaction) {
            return (
              <div className="text-right text-xs text-muted-foreground">
                Ø {formatCurrency(transaction.positionAvgPrice)}
              </div>
            );
          }
          return null;
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.position?.totalPnL || 0;
          const b = rowB.original.position?.totalPnL || 0;
          return a - b;
        },
      },
      // Actions Column
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        size: 90,
        cell: ({ row }) => {
          const { type, position } = row.original;
          if (type !== 'position' || !position) return null;
          return (
            <div className="flex items-center justify-end gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(position)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onAddTransaction && position.remainingShares > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onAddTransaction(position.id)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onAddTransaction]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.type === 'position',
    getSubRows: (row) => {
      if (row.type === 'position' && row.position) {
        return data.filter((r) => r.parentId === row.position!.id);
      }
      return undefined;
    },
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
            table.getRowModel().rows.map((row) => {
              const isTransaction = row.original.type === 'transaction';
              const transactionPnl = row.original.transaction?.pnl;
              const transactionType = row.original.transaction?.type;

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    isTransaction && 'border-l-4',
                    isTransaction && getTransactionRowBg(transactionType!, transactionPnl),
                    !isTransaction && 'hover:bg-muted/50 cursor-pointer'
                  )}
                  onClick={() => {
                    if (!isTransaction) {
                      row.toggleExpanded();
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isTransaction ? 'py-1 text-xs' : 'py-2',
                        isTransaction && cell.column.id === 'symbol' && 'pl-8'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
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
