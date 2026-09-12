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
} from 'lucide-react';
import { Position, Transaction, TransactionType, PositionStatus } from '@/types/position';
import { TradeSide } from '@/types/trade';
import { formatCurrency, formatPercent, formatDateSafe } from '@/lib/tradeUtils';
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
 * Get background color for header columns
 */
function getHeaderBg(columnId: string): string {
  switch (columnId) {
    case 'expander':
    case 'symbol':
    case 'type':
    case 'status':
    case 'side':
    case 'shares':
    case 'actions':
      return 'bg-slate-50 dark:bg-slate-900';
    case 'entryDate':
    case 'entryPrice':
      return 'bg-blue-50 dark:bg-blue-950/40';
    case 'exitDate':
    case 'exitPrice':
      return 'bg-amber-50 dark:bg-amber-950/40';
    case 'fee':
    case 'tax':
      return 'bg-purple-50 dark:bg-purple-950/40';
    case 'netPnl':
    case 'grossPnl':
      return 'bg-green-50 dark:bg-green-950/40';
    default:
      return '';
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
  const { t, locale } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

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
            className="-ml-3 h-8 text-xs font-semibold"
          >
            {t.common.symbol}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.symbol}</span>,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: t.common.type,
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      {
        id: 'status',
        header: t.common.status,
        cell: ({ row }) => {
          const isOpen = row.original.remainingShares > 0;
          return (
            <Badge variant={isOpen ? 'default' : 'secondary'}>
              {isOpen ? t.common.open : t.common.closed}
            </Badge>
          );
        },
      },
      {
        id: 'side',
        accessorKey: 'side',
        header: t.common.side,
        cell: ({ row }) => {
          const isLong = row.original.side === TradeSide.LONG;
          return (
            <Badge variant={isLong ? 'default' : 'secondary'}>
              {row.original.side}
            </Badge>
          );
        },
      },
      {
        id: 'shares',
        accessorKey: 'totalEntryShares',
        header: t.common.shares,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.totalEntryShares}
          </span>
        ),
      },
      {
        id: 'entryDate',
        header: `${t.dashboard.entryGroup} ${t.common.date}`,
        cell: ({ row }) => (
          <span className="text-sm">
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
            className="h-8 text-xs font-semibold"
          >
            {t.dashboard.entryGroup} {t.common.price}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {formatCurrency(row.original.avgEntryPrice, locale)}
          </span>
        ),
      },
      {
        id: 'exitDate',
        header: `${t.dashboard.exitGroup} ${t.common.date}`,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.lastExitDate
              ? formatDateSafe(row.original.lastExitDate, 'MMM dd, yyyy')
              : <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      {
        id: 'exitPrice',
        header: `${t.dashboard.exitGroup} ${t.common.price}`,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.avgExitPrice
              ? formatCurrency(row.original.avgExitPrice, locale)
              : <span className="text-muted-foreground">-</span>}
          </span>
        ),
      },
      {
        id: 'fee',
        header: t.common.fee,
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {formatCurrency(row.original.fee || 0, locale)}
          </span>
        ),
      },
      {
        id: 'tax',
        header: t.common.tax,
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.tax !== undefined && row.original.tax < 0 ? (
              <span className="text-emerald-600 font-medium" title={t.common.taxCredit}>
                +{formatCurrency(Math.abs(row.original.tax), locale)}
              </span>
            ) : (
              formatCurrency(row.original.tax || 0, locale)
            )}
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
            className="h-8 text-xs font-semibold"
          >
            Net P&L
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const netPnl = row.original.totalNetPnL !== undefined ? row.original.totalNetPnL : row.original.totalPnL;
          const isClosed = row.original.remainingShares === 0 || row.original.status === PositionStatus.CLOSED;
          return isClosed && netPnl !== undefined ? (
            <div className={cn('font-bold text-sm', netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {formatCurrency(netPnl, locale)}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
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
              className="h-8 text-xs font-semibold"
            >
              Gross P&L (%)
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const isClosed = row.original.remainingShares === 0 || row.original.status === PositionStatus.CLOSED;
          return isClosed && row.original.totalPnL !== undefined ? (
            <div className="text-xs text-right">
              <span className={cn('font-medium', row.original.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {formatCurrency(row.original.totalPnL, locale)}
              </span>
              {row.original.totalPnLPercent !== undefined && (
                <span className="text-muted-foreground ml-1">
                  ({formatPercent(row.original.totalPnLPercent, locale)})
                </span>
              )}
            </div>
          ) : (
            <div className="text-right text-muted-foreground">-</div>
          );
        },
      },
      {
        id: 'actions',
        size: 40,
        header: () => <div className="text-right pr-2">{t.common.actions}</div>,
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
                      <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-normal">
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
    <div className="rounded-md border overflow-x-auto">
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
                    <TableCell key={cell.id} className="py-2.5">
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
                          'border-l-4 text-xs',
                          getTransactionRowBg(txn.type, txn.pnl)
                        )}
                      >
                        {/* 1. Expander cell */}
                        <TableCell />

                        {/* 2. Date under Symbol */}
                        <TableCell className="font-medium text-xs">
                          {formatDateSafe(txn.date, 'MMM dd, yyyy')}
                        </TableCell>

                        {/* 3. Type */}
                        <TableCell>
                          <Badge
                            variant={isEntry ? 'outline' : 'secondary'}
                            className="text-[10px] px-1.5 py-0 h-4 font-normal"
                          >
                            {isEntry ? 'Entry' : 'Exit'}
                          </Badge>
                        </TableCell>

                        {/* 4. Status placeholder */}
                        <TableCell className="text-muted-foreground">-</TableCell>

                        {/* 5. Side placeholder */}
                        <TableCell className="text-muted-foreground">-</TableCell>

                        {/* 6. Shares */}
                        <TableCell className="font-medium">
                          {isExit && '-'}{txn.shares}
                        </TableCell>

                        {/* 7. Entry Date */}
                        <TableCell className="text-muted-foreground">
                          {isEntry ? formatDateSafe(txn.date, 'MMM dd, yyyy') : '-'}
                        </TableCell>

                        {/* 8. Entry Price */}
                        <TableCell className="font-mono">
                          {isEntry ? formatCurrency(txn.price, locale) : '-'}
                        </TableCell>

                        {/* 9. Exit Date */}
                        <TableCell className="text-muted-foreground">
                          {isExit ? formatDateSafe(txn.date, 'MMM dd, yyyy') : '-'}
                        </TableCell>

                        {/* 10. Exit Price */}
                        <TableCell className="font-mono">
                          {isExit ? formatCurrency(txn.price, locale) : '-'}
                        </TableCell>

                        {/* 11. Fee */}
                        <TableCell className="font-mono">
                          {txn.fee !== undefined ? formatCurrency(txn.fee, locale) : '-'}
                        </TableCell>

                        {/* 12. Tax */}
                        <TableCell className="font-mono">
                          {txn.tax !== undefined ? (
                            txn.tax < 0 ? (
                              <span className="text-emerald-600 font-medium">
                                +{formatCurrency(Math.abs(txn.tax), locale)}
                              </span>
                            ) : (
                              formatCurrency(txn.tax, locale)
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* 13. Net P&L */}
                        <TableCell>
                          {isExit && netPnl !== undefined ? (
                            <div
                              className={cn(
                                'font-bold font-mono',
                                netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              )}
                            >
                              {formatCurrency(netPnl, locale)}
                            </div>
                          ) : !isExit ? (
                            <span className="text-muted-foreground font-mono">
                              ø {formatCurrency(txn.positionAvgPrice, locale)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* 14. Gross P&L */}
                        <TableCell className="text-right">
                          {isExit && txn.pnl !== undefined ? (
                            <div
                              className={cn(
                                'font-medium font-mono',
                                txn.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              )}
                            >
                              {formatCurrency(txn.pnl, locale)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
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
  );
}
