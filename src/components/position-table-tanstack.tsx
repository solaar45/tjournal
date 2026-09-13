"use client";

import { useMemo, useState } from 'react';
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
  Edit,
  Plus,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Position, Transaction, TransactionType, PositionStatus } from '@/types/position';
import { TradeSide } from '@/types/trade';
import {
  formatCurrency,
  formatPercent,
  formatDateSafe,
  formatTax,
  formatSignedCurrency,
  formatSignedPercent,
  getAmountColorClass,
  getTaxColorClass,
} from '@/lib/tradeUtils';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
 * Get background color for transaction rows (Neutral Charcoal / Pure Tint)
 */
function getTransactionRowBg(type: TransactionType, pnl?: number): string {
  if (type === TransactionType.ENTRY) {
    return 'bg-blue-500/10 dark:bg-blue-950/20 hover:bg-blue-500/15 border-l-blue-500';
  }
  if (type === TransactionType.EXIT) {
    if (pnl === undefined) return 'bg-muted/20 dark:bg-muted/10';
    return pnl >= 0
      ? 'bg-emerald-500/10 dark:bg-emerald-950/25 hover:bg-emerald-500/15 border-l-[#00C48C]'
      : 'bg-rose-500/10 dark:bg-rose-950/25 hover:bg-rose-500/15 border-l-[#FF647C]';
  }
  return '';
}

/**
 * Get background color for header columns (Clean high-contrast slate-neutral)
 */
function getHeaderBg(_columnId?: string): string {
  return 'bg-muted/50 text-muted-foreground font-semibold text-sm py-3 px-2.5';
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
  const { t, locale } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});

  // Define flat columns matching Dashboard table design
  const columns = useMemo<ColumnDef<Position>[]>(
    () => [
      {
        id: 'expander',
        header: '',
        size: 36,
        cell: ({ row }) => (
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
        ),
      },
      {
        accessorKey: 'symbol',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.symbol}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-base text-foreground tracking-tight">{row.original.symbol}</span>,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.type}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full font-semibold">{row.original.type}</Badge>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.status}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const isOpen = row.original.remainingShares > 0;
          return (
            <Badge variant={isOpen ? 'blue' : 'secondary'} className="text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {isOpen ? t.common.open : t.common.closed}
            </Badge>
          );
        },
      },
      {
        id: 'side',
        accessorKey: 'side',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.side}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const isLong = row.original.side === TradeSide.LONG || (row.original.side as string) === 'Long';
          return (
            <div className="flex items-center" title={isLong ? 'Long' : 'Short'}>
              {isLong ? (
                <TrendingUp className="h-5 w-5 text-[#00C48C] stroke-[2.2]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[#FF647C] stroke-[2.2]" />
              )}
            </div>
          );
        },
      },
      {
        id: 'shares',
        accessorKey: 'totalEntryShares',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.shares}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {row.original.totalEntryShares}
          </span>
        ),
      },
      {
        id: 'entryDate',
        accessorKey: 'firstEntryDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.dashboard.entryGroup} {t.common.date}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {formatDateSafe(row.original.firstEntryDate, 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        id: 'entryPrice',
        accessorKey: 'avgEntryPrice',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.dashboard.entryGroup} {t.common.price}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {formatCurrency(row.original.avgEntryPrice, locale)}
          </span>
        ),
      },
      {
        id: 'exitDate',
        accessorKey: 'lastExitDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.dashboard.exitGroup} {t.common.date}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {row.original.lastExitDate
              ? formatDateSafe(row.original.lastExitDate, 'MMM dd, yyyy')
              : <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      {
        id: 'exitPrice',
        accessorKey: 'avgExitPrice',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.dashboard.exitGroup} {t.common.price}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {row.original.avgExitPrice
              ? formatCurrency(row.original.avgExitPrice, locale)
              : <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      {
        id: 'fee',
        accessorKey: 'fee',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.fee}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {formatCurrency(row.original.fee || 0, locale)}
          </span>
        ),
      },
      {
        id: 'tax',
        accessorKey: 'tax',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            {t.common.tax}
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-base font-mono font-semibold text-foreground/80">
            {formatTax(row.original.tax, locale)}
          </span>
        ),
      },
      {
        id: 'netPnl',
        accessorKey: 'totalNetPnL',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
          >
            Net P&L
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const netPnl = row.original.totalNetPnL !== undefined ? row.original.totalNetPnL : row.original.totalPnL;
          const isClosed = row.original.remainingShares === 0 || row.original.status === PositionStatus.CLOSED;
          return isClosed && netPnl !== undefined ? (
            <div className={cn('font-bold font-mono text-base tracking-tight', getAmountColorClass(netPnl))}>
              {formatSignedCurrency(netPnl, locale)}
            </div>
          ) : (
            <span className="text-muted-foreground font-mono text-base">-</span>
          );
        },
      },
      {
        id: 'grossPnl',
        accessorKey: 'totalPnL',
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-mr-2 h-8 text-sm font-semibold text-muted-foreground hover:text-foreground px-2"
            >
              Gross P&L (%)
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const isClosed = row.original.remainingShares === 0 || row.original.status === PositionStatus.CLOSED;
          return isClosed && row.original.totalPnL !== undefined ? (
            <div className="text-base text-right font-mono">
              <span className={cn('font-bold', getAmountColorClass(row.original.totalPnL))}>
                {formatSignedCurrency(row.original.totalPnL, locale)}
              </span>
              {row.original.totalPnLPercent !== undefined && (
                <span className={cn('ml-1.5 font-semibold', getAmountColorClass(row.original.totalPnLPercent))}>
                  ({formatSignedPercent(row.original.totalPnLPercent, locale)})
                </span>
              )}
            </div>
          ) : (
            <div className="text-right text-muted-foreground font-mono text-base">-</div>
          );
        },
      },
      {
        id: 'actions',
        size: 40,
        header: () => <div className="text-right pr-2 text-sm font-semibold text-muted-foreground">{t.common.actions}</div>,
        cell: ({ row }) => {
          const isClosed = row.original.status === PositionStatus.CLOSED || row.original.remainingShares === 0;
          return (
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(row.original)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>{t.table.editTrade}</span>
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
                    <span>{t.table.addTransaction}</span>
                    {isClosed && (
                      <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                        {t.table.closedBadge}
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
                        <span>{t.table.deleteTrade}</span>
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
    [onEdit, onAddTransaction, onDelete, t, locale]
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
    <>
      {/* Desktop View (Visible on md and above) */}
      <div className="hidden md:block rounded-xl border border-border/70 overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b text-xs">
                {headerGroup.headers.map((header) => {
                  const bgClass = getHeaderBg(header.id);
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn("font-semibold", bgClass)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
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
                      <TableCell key={cell.id} className="py-3 px-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expanded Transaction Rows */}
                  {row.getIsExpanded() &&
                    row.original.transactions.map((txn) => {
                      const isEntry = txn.type === TransactionType.ENTRY;
                      const isExit = txn.type === TransactionType.EXIT;
                      const netPnl = txn.netPnl !== undefined ? txn.netPnl : txn.pnl;

                      return (
                        <TableRow
                          key={txn.id}
                          className={cn(
                            'border-l-4 text-sm',
                            getTransactionRowBg(txn.type, txn.pnl)
                          )}
                        >
                          {/* 1. Expander cell */}
                          <TableCell className="px-2.5" />

                          {/* 2. Date under Symbol */}
                          <TableCell className="font-semibold text-sm font-mono text-foreground/80 px-2.5">
                            {formatDateSafe(txn.date, 'MMM dd, yyyy')}
                          </TableCell>

                          {/* 3. Type */}
                          <TableCell className="px-2.5">
                            <Badge
                              variant={isEntry ? 'outline' : 'secondary'}
                              className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                            >
                              {isEntry ? 'Entry' : 'Exit'}
                            </Badge>
                          </TableCell>

                          {/* 4. Status placeholder */}
                          <TableCell className="text-muted-foreground font-mono text-sm px-2.5">-</TableCell>

                          {/* 5. Side placeholder */}
                          <TableCell className="text-muted-foreground font-mono text-sm px-2.5">-</TableCell>

                          {/* 6. Shares */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {isExit && '-'}{txn.shares}
                          </TableCell>

                          {/* 7. Entry Date */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {isEntry ? formatDateSafe(txn.date, 'MMM dd, yyyy') : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 8. Entry Price */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {isEntry ? formatCurrency(txn.price, locale) : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 9. Exit Date */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {isExit ? formatDateSafe(txn.date, 'MMM dd, yyyy') : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 10. Exit Price */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {isExit ? formatCurrency(txn.price, locale) : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 11. Fee */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {txn.fee !== undefined ? formatCurrency(txn.fee, locale) : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 12. Tax */}
                          <TableCell className="font-mono text-sm font-semibold text-foreground/80 px-2.5">
                            {txn.tax !== undefined ? formatTax(txn.tax, locale) : <span className="text-muted-foreground">-</span>}
                          </TableCell>

                          {/* 13. Net P&L */}
                          <TableCell>
                            {isExit && netPnl !== undefined ? (
                              <div className={cn('font-bold font-mono text-sm', getAmountColorClass(netPnl))}>
                                {formatSignedCurrency(netPnl, locale)}
                              </div>
                            ) : !isExit ? (
                              <span className="text-muted-foreground font-mono text-sm">
                                ø {formatCurrency(txn.positionAvgPrice, locale)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-mono text-sm">-</span>
                            )}
                          </TableCell>

                          {/* 14. Gross P&L */}
                          <TableCell className="text-right">
                            {isExit && txn.pnl !== undefined ? (
                              <div className={cn('font-semibold font-mono text-sm', getAmountColorClass(txn.pnl))}>
                                {formatSignedCurrency(txn.pnl, locale)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground font-mono text-sm">-</span>
                            )}
                          </TableCell>

                          {/* 15. Actions placeholder */}
                          <TableCell />
                        </TableRow>
                      );
                    })}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="h-24 text-center">
                  {t.table.noPositions}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (Visible on < md screens) */}
      <div className="block md:hidden space-y-3">
        {positions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-border/60 bg-card text-muted-foreground text-xs">
            {t.table.noPositions}
          </div>
        ) : (
          positions.map((pos) => {
            const isOpen = pos.remainingShares > 0;
            const isClosed = !isOpen || pos.status === PositionStatus.CLOSED;
            const netPnl = pos.totalNetPnL !== undefined ? pos.totalNetPnL : pos.totalPnL;
            const isLong = pos.side === TradeSide.LONG || (pos.side as string) === 'Long';
            const isExpanded = !!mobileExpanded[pos.id];
            const hasTransactions = pos.transactions && pos.transactions.length > 0;

            return (
              <div
                key={pos.id}
                className="rounded-xl border border-border/70 bg-card/95 shadow-xs overflow-hidden"
              >
                {/* 1. Header: Symbol, Badges, Actions */}
                <div className="p-3.5 border-b border-border/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-bold text-base text-foreground tracking-tight">
                      {pos.symbol}
                    </span>
                    {/* Side Kurspfeil */}
                    <span
                      className="inline-flex items-center justify-center shrink-0"
                      title={isLong ? 'Long' : 'Short'}
                    >
                      {isLong ? (
                        <TrendingUp className="h-5 w-5 text-[#00C48C] stroke-[2.2]" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-[#FF647C] stroke-[2.2]" />
                      )}
                    </span>
                    {/* Type Badge */}
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {pos.type}
                    </Badge>
                    {/* Status Badge */}
                    <Badge
                      variant={isOpen ? 'blue' : 'secondary'}
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    >
                      {isOpen ? t.common.open : t.common.closed}
                    </Badge>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-1 shrink-0">
                    {hasTransactions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setMobileExpanded((prev) => ({ ...prev, [pos.id]: !prev[pos.id] }))
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(pos)}
                            className="cursor-pointer text-xs font-medium"
                          >
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            <span>{t.table.editTrade}</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          disabled={isClosed}
                          onClick={() => {
                            if (!isClosed && onAddTransaction) {
                              onAddTransaction(pos.id);
                            }
                          }}
                          className={cn(
                            "cursor-pointer text-xs font-medium",
                            isClosed && "opacity-50 cursor-not-allowed text-muted-foreground focus:bg-transparent"
                          )}
                        >
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          <span>{t.table.addTransaction}</span>
                          {isClosed && (
                            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-normal">
                              {t.table.closedBadge}
                            </span>
                          )}
                        </DropdownMenuItem>

                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(pos)}
                              className="cursor-pointer text-xs font-medium text-[#FF647C] focus:text-[#FF647C]"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span>{t.table.deleteTrade}</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 2. P&L Highlight Bar */}
                <div className="p-3 sm:p-3.5 bg-muted/30 border-b border-border/40 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t.table.netShort} P&L
                    </div>
                    <div className={cn("text-lg font-bold font-mono tracking-tight mt-0.5", isClosed && netPnl !== undefined ? getAmountColorClass(netPnl) : "text-muted-foreground")}>
                      {isClosed && netPnl !== undefined ? formatSignedCurrency(netPnl, locale) : "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t.table.grossShort} P&L (%)
                    </div>
                    <div className="text-sm font-mono mt-0.5">
                      {isClosed && pos.totalPnL !== undefined ? (
                        <>
                          <span className={cn("font-bold", getAmountColorClass(pos.totalPnL))}>
                            {formatSignedCurrency(pos.totalPnL, locale)}
                          </span>
                          {pos.totalPnLPercent !== undefined && (
                            <span className={cn("ml-1 font-semibold text-xs", getAmountColorClass(pos.totalPnLPercent))}>
                              ({formatSignedPercent(pos.totalPnLPercent, locale)})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Metrics Grid */}
                <div className="p-3 sm:p-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div>
                    <span className="text-muted-foreground block text-xs font-medium mb-0.5">{t.common.shares} / Einstieg</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {pos.totalEntryShares} Stk. @ {formatCurrency(pos.avgEntryPrice, locale)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-muted-foreground block text-xs font-medium mb-0.5">Ausstieg</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {pos.avgExitPrice ? `${formatCurrency(pos.avgExitPrice, locale)}` : '-'}
                      {pos.lastExitDate ? ` (${formatDateSafe(pos.lastExitDate, 'dd.MM.yy')})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-xs font-medium mb-0.5">Einstiegsdatum</span>
                    <span className="font-mono font-medium text-muted-foreground text-sm">
                      {formatDateSafe(pos.firstEntryDate, 'dd.MM.yyyy')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-muted-foreground block text-xs font-medium mb-0.5">{t.table.costsAndTax}</span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {formatCurrency(pos.fee || 0, locale)} / {formatTax(pos.tax, locale)}
                    </span>
                  </div>
                </div>

                {/* 4. Expandable Transactions List */}
                {hasTransactions && isExpanded && (
                  <div className="border-t border-border/40 bg-muted/20 p-3 space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Transaktionen ({pos.transactions.length})
                    </div>
                    {pos.transactions.map((txn) => {
                      const isEntry = txn.type === TransactionType.ENTRY;
                      const isExit = txn.type === TransactionType.EXIT;
                      const txnNet = txn.netPnl !== undefined ? txn.netPnl : txn.pnl;

                      return (
                        <div
                          key={txn.id}
                          className={cn(
                            "p-2.5 rounded-lg border flex flex-col gap-1.5",
                            getTransactionRowBg(txn.type, txn.pnl)
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={isEntry ? 'outline' : 'secondary'}
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              >
                                {isEntry ? 'Entry' : 'Exit'}
                              </Badge>
                              <span className="font-semibold text-foreground text-xs">
                                {formatDateSafe(txn.date, 'dd.MM.yyyy')}
                              </span>
                            </div>
                            <div className="font-mono font-semibold text-xs sm:text-sm text-foreground">
                              {isExit && '-'}{txn.shares} Stk. @ {formatCurrency(txn.price, locale)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1.5 border-t border-border/20">
                            <div className="text-foreground">
                              {t.table.feeShort}: {txn.fee !== undefined ? formatCurrency(txn.fee, locale) : '-'} | {t.table.taxShort}: {formatTax(txn.tax, locale)}
                            </div>
                            {isExit && txnNet !== undefined && (
                              <div className={cn("font-bold text-sm", getAmountColorClass(txnNet))}>
                                Net: {formatSignedCurrency(txnNet, locale)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
