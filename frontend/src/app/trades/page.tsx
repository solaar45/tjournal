"use client";

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTrades, useDeleteTrade } from '@/hooks/useTrades';
import { Trade, TradeType, TradeSide, TradeStatus } from '@/types/trade';
import { formatCurrency, formatPercent } from '@/lib/tradeUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeForm } from '@/components/trade-form';
import { EditTradeDialog } from '@/components/edit-trade-dialog';
import { toast } from 'sonner';

export default function TradesPage() {
  const { data: trades, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Spalten-Definition
  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        accessorKey: 'symbol',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Symbol
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('symbol')}</div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Typ',
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue('type')}</Badge>
        ),
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'side',
        header: 'Seite',
        cell: ({ row }) => (
          <Badge variant={row.getValue('side') === TradeSide.LONG ? 'default' : 'secondary'}>
            {row.getValue('side')}
          </Badge>
        ),
      },
      {
        accessorKey: 'entryShares',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Anzahl
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const entryShares = row.original.entryShares || row.original.shares;
          const exitShares = row.original.exitShares || 0;
          const remaining = entryShares - exitShares;
          
          return (
            <div className="text-sm">
              <div className="font-medium">{entryShares}</div>
              {exitShares > 0 && (
                <div className="text-xs text-muted-foreground">
                  -{exitShares} (Ø {remaining})
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'entryPrice',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Einstieg
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{formatCurrency(row.getValue('entryPrice'))}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(row.original.entryDate), 'dd.MM.yyyy', { locale: de })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'exitPrice',
        header: 'Ausstieg',
        cell: ({ row }) => {
          const exitPrice = row.original.exitPrice;
          const exitDate = row.original.exitDate;
          
          if (!exitPrice) {
            return <span className="text-muted-foreground">-</span>;
          }
          
          return (
            <div className="text-sm">
              <div>{formatCurrency(exitPrice)}</div>
              {exitDate && (
                <div className="text-xs text-muted-foreground">
                  {format(new Date(exitDate), 'dd.MM.yyyy', { locale: de })}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.getValue('status') === 'open' ? 'default' : 'secondary'}>
            {row.getValue('status') === 'open' ? 'Offen' : 'Geschlossen'}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'pnl',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="w-full justify-end"
            >
              P&L
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const pnl = row.original.pnl;
          const pnlPercent = row.original.pnlPercent;
          
          if (pnl === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          
          return (
            <div className="text-right">
              <div className={`font-medium ${
                pnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(pnl)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercent(pnlPercent || 0)}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const trade = row.original;

          const handleEdit = () => {
            setEditingTrade(trade);
          };

          const handleDelete = () => {
            if (window.confirm(`Trade ${trade.symbol} wirklich löschen?`)) {
              deleteTrade.mutate(trade.id);
            }
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menü öffnen</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(trade.id)}
                >
                  ID kopieren
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [deleteTrade]
  );

  // Gefilterte Daten
  const filteredData = useMemo(() => {
    if (!trades) return [];
    
    return trades.filter((trade) => {
      const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
      const matchesType = typeFilter === 'all' || trade.type === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [trades, statusFilter, typeFilter]);

  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alle Trades</h1>
          <p className="text-muted-foreground">
            Verwalte und analysiere deine {trades?.length || 0} Trades
          </p>
        </div>
        <TradeForm />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
          <CardDescription>
            Filtere deine Trades nach Status, Typ oder suche nach Symbol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Nach Symbol suchen..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="closed">Geschlossen</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {Object.values(TradeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            {(globalFilter || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setGlobalFilter('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Keine Trades gefunden.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} von {trades?.length || 0} Trade(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Zurück
          </Button>
          <div className="text-sm">
            Seite {table.getState().pagination.pageIndex + 1} von{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Weiter
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingTrade && (
        <EditTradeDialog
          trade={editingTrade}
          open={!!editingTrade}
          onOpenChange={(open) => !open && setEditingTrade(null)}
        />
      )}
    </div>
  );
}
