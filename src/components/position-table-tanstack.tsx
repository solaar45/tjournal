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
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Position, Transaction, TransactionType } from '@/types/position';
import { formatCurrency, formatPercent, formatDateSafe } from '@/lib/tradeUtils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onDelete?: (position: Position) => void;
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
 * Get status text and color classes based on P&L
 */
function getStatusDisplay(position: Position): { text: string; className: string } {
  // If position is still open (has remaining shares)
  if (position.remainingShares > 0) {
    return {
      text: 'Open',
      className: 'text-muted-foreground',
    };
  }
  
  // Closed position - Win or Loss based on P&L
  if (position.totalPnL >= 0) {
    return {
      text: 'Win',
      className: 'text-green-600 dark:text-green-400',
    };
  } else {
    return {
      text: 'Loss',
      className: 'text-red-600 dark:text-red-400',
    };
  }
}

/**
 * Main TanStack Position Table Component
 */
export function PositionTableTanstack({
  positions,
  onEdit,
  onAddTransaction,
  onDelete,
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
      // Side Column - Icon only
      {
        id: 'side',
        accessorKey: 'side',
        header: '',
        size: 40,
        cell: ({ row }) => {
          const isLong = row.original.side === 'Long';
          return (
            <div className="flex items-center justify-center" title={row.original.side}>
              {isLong ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
          );
        },
      },
      // Status Column - Win/Loss/Open
      {
        id: 'status',
        header: 'Status',
        size: 60,
        cell: ({ row }) => {
          const { text, className } = getStatusDisplay(row.original);
          return (
            <span className={cn('text-xs font-medium', className)}>
              {text}
            </span>
          );
        },
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
              ø Price
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
      // Kosten & Steuer Column
      {
        id: 'costs',
        header: () => <div className="text-right">Kosten & Steuer</div>,
        cell: ({ row }) => {
          const fee = row.original.fee || 0;
          const tax = row.original.tax || 0;
          return (
            <div className="text-right text-xs">
              <div>
                <span className="text-muted-foreground text-[11px]">Geb: </span>
                <span className="font-mono">{formatCurrency(fee)}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">St: </span>
                {tax < 0 ? (
                  <span className="font-mono text-emerald-600 font-medium" title="Steuererstattung (wird zum Nettoergebnis addiert)">
                    +{formatCurrency(Math.abs(tax))}
                  </span>
                ) : (
                  <span className="font-mono">{formatCurrency(tax)}</span>
                )}
              </div>
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
              P/L (Netto / Brutto)
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const netPnL = row.original.totalNetPnL !== undefined ? row.original.totalNetPnL : row.original.totalPnL;
          const grossPnL = row.original.totalPnL;
          const isProfitable = netPnL >= 0;
          return (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                {isProfitable ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-600" />
                )}
                <span
                  className={cn(
                    'font-bold text-sm',
                    isProfitable ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {formatCurrency(netPnL)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Brutto: <span className={grossPnL >= 0 ? 'text-emerald-600/90 font-medium' : 'text-rose-600/90 font-medium'}>{formatCurrency(grossPnL)}</span>
                <span className="ml-1">({formatPercent(row.original.totalPnLPercent)})</span>
              </div>
            </div>
          );
        },
      },
      // Actions Column (Option C: Kompaktes Dropdown-Menü)
      {
        id: 'actions',
        header: () => <div className="text-right pr-2">Aktionen</div>,
        size: 60,
        cell: ({ row }) => {
          const isClosed = row.original.remainingShares === 0;

          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                    title="Aktionen anzeigen"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Aktionen</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(row.original)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Trade bearbeiten</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    disabled={isClosed}
                    onClick={() => {
                      if (!isClosed && onAddTransaction) {
                        onAddTransaction(row.original.id);
                      }
                    }}
                    className={cn(
                      "cursor-pointer",
                      isClosed && "opacity-50 cursor-not-allowed text-muted-foreground focus:bg-transparent"
                    )}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Transaktion hinzufügen</span>
                    {isClosed && (
                      <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-normal">
                        Geschlossen
                      </span>
                    )}
                  </DropdownMenuItem>

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(row.original)}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Trade löschen</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onEdit, onAddTransaction, onDelete]
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
    getExpandedRowModel: getExpandedRowModel(),
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
                      <TableCell className="py-1 pl-8 text-xs text-muted-foreground">
                        {formatDateSafe(txn.date, 'dd.MM.yy')}
                      </TableCell>

                      {/* Transaction Type (Entry/Exit) - now just text */}
                      <TableCell className="py-1" colSpan={2}>
                        <span className={cn(
                          'text-xs font-medium',
                          txn.type === TransactionType.ENTRY
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                        )}>
                          {txn.type === TransactionType.ENTRY ? 'Entry' : 'Exit'}
                        </span>
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

                      {/* Value (Entries column) */}
                      <TableCell className="py-1 text-right text-xs text-muted-foreground">
                        {txn.type === TransactionType.ENTRY ? formatCurrency(txn.value) : '-'}
                      </TableCell>

                      {/* Exits column */}
                      <TableCell className="py-1 text-right text-xs text-muted-foreground">
                        {txn.type === TransactionType.EXIT ? formatCurrency(txn.value) : '-'}
                      </TableCell>

                      {/* Kosten & Steuer */}
                      <TableCell className="py-1 text-right text-xs">
                        {txn.fee !== undefined || txn.tax !== undefined ? (
                          <div className="text-[11px]">
                            {txn.fee !== undefined && (
                              <div><span className="text-muted-foreground">Geb: </span><span className="font-mono">{formatCurrency(txn.fee)}</span></div>
                            )}
                            {txn.tax !== undefined && (
                              <div><span className="text-muted-foreground">St: </span>
                                {txn.tax < 0 ? (
                                  <span className="font-mono text-emerald-600 font-medium">+{formatCurrency(Math.abs(txn.tax))}</span>
                                ) : (
                                  <span className="font-mono">{formatCurrency(txn.tax)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* P/L (Netto & Brutto) or Avg Price */}
                      <TableCell className="py-1 text-right">
                        {txn.pnl !== undefined ? (
                          <div>
                            <div
                              className={cn(
                                'font-semibold text-xs',
                                (txn.netPnl !== undefined ? txn.netPnl : txn.pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              )}
                            >
                              {formatCurrency(txn.netPnl !== undefined ? txn.netPnl : txn.pnl)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Brutto: {formatCurrency(txn.pnl)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">
                            ø {formatCurrency(txn.positionAvgPrice)}
                          </span>
                        )}
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
