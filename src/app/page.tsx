"use client";

import { useTrades, useTradeStats } from '@/hooks/useTrades';
import { formatCurrency, formatPercent, formatDateSafe } from '@/lib/tradeUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TradeForm } from '@/components/trade-form';
import { CsvImportDialog } from '@/components/csv-import-dialog';
import { TradeType, TradeSide } from '@/types/trade';

export default function DashboardPage() {
  const { data: trades, isLoading: tradesLoading, error: tradesError } = useTrades();
  const { data: stats, isLoading: statsLoading, error: statsError } = useTradeStats();

  // Loading State
  if (tradesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Daten...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (tradesError || statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Fehler beim Laden der Daten</p>
          <p className="text-sm text-muted-foreground">
            {tradesError?.message || statsError?.message}
          </p>
        </div>
      </div>
    );
  }

  // Recent Trades (letzte 5)
  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Übersicht über deine Trading-Performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CsvImportDialog />
          <TradeForm />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total P&L */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt P&L (Netto)
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.totalNetPnL !== undefined ? stats.totalNetPnL : (stats?.totalPnL || 0)) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatCurrency(stats?.totalNetPnL !== undefined ? stats.totalNetPnL : (stats?.totalPnL || 0))}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
              <span>Brutto: {formatCurrency(stats?.totalPnL || 0)}</span>
              {(stats?.totalFees || stats?.totalTax) ? (
                <span>(Geb: {formatCurrency(stats?.totalFees || 0)}, St: {formatCurrency(stats?.totalTax || 0)})</span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Win Rate
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Durchschnittliche Gewinnrate
            </p>
          </CardContent>
        </Card>

        {/* Open Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offene Trades
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.openTrades || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktive Positionen
            </p>
          </CardContent>
        </Card>

        {/* Total Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamt Trades
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTrades || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alle erfassten Trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best & Worst</CardTitle>
            <CardDescription>
              Größter Gewinn und Verlust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Größter Gewinn</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(stats?.largestWin || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Größter Verlust</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(stats?.largestLoss || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">Durchschn. Gewinn</span>
              <span className="text-sm font-medium">
                {formatCurrency(stats?.avgWin || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Durchschn. Verlust</span>
              <span className="text-sm font-medium">
                {formatCurrency(stats?.avgLoss || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade-Verteilung</CardTitle>
            <CardDescription>
              Aufschlüsselung nach Status und Typ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Geschlossen</span>
              <span className="text-sm font-medium">
                {stats?.closedTrades || 0} Trades
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Offen</span>
              <span className="text-sm font-medium">
                {stats?.openTrades || 0} Trades
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {Object.values(TradeType).map((type) => {
                  const count = trades?.filter(t => t.type === type).length || 0;
                  if (count === 0) return null;
                  return (
                    <Badge key={type} variant="outline">
                      {type}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Trades</CardTitle>
          <CardDescription>
            Die 5 neuesten Trades in deinem Journal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Noch keine Trades vorhanden.</p>
              <TradeForm trigger={<Button>Ersten Trade erstellen</Button>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow>
                    <TableHead colSpan={6} className="text-center bg-slate-50 font-semibold">Information</TableHead>
                    <TableHead colSpan={2} className="text-center bg-blue-50 font-semibold">Einstieg</TableHead>
                    <TableHead colSpan={2} className="text-center bg-amber-50 font-semibold">Ausstieg</TableHead>
                    <TableHead colSpan={2} className="text-center bg-purple-50 font-semibold">Kosten & Steuer</TableHead>
                    <TableHead colSpan={2} className="text-center bg-green-50 font-semibold">Rendite</TableHead>
                  </TableRow>
                  {/* Sub-Header Row */}
                  <TableRow className="border-b text-xs">
                    <TableHead className="bg-slate-50">Symbol</TableHead>
                    <TableHead className="bg-slate-50">Typ</TableHead>
                    <TableHead className="bg-slate-50">Status</TableHead>
                    <TableHead className="bg-slate-50">Seite</TableHead>
                    <TableHead className="bg-slate-50">Broker</TableHead>
                    <TableHead className="bg-slate-50">Anzahl</TableHead>
                    <TableHead className="bg-blue-50">Datum</TableHead>
                    <TableHead className="bg-blue-50">Preis</TableHead>
                    <TableHead className="bg-amber-50">Datum</TableHead>
                    <TableHead className="bg-amber-50">Preis</TableHead>
                    <TableHead className="bg-purple-50">Gebühr</TableHead>
                    <TableHead className="bg-purple-50">Steuer</TableHead>
                    <TableHead className="bg-green-50">Netto P&L</TableHead>
                    <TableHead className="bg-green-50 text-right">Brutto P&L (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrades.map((trade) => {
                    const netPnl = trade.netPnl !== undefined ? trade.netPnl : trade.pnl;
                    const isClosed = trade.status === 'closed';

                    return (
                      <TableRow key={trade.id}>
                        {/* Information Group */}
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{trade.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={trade.status === 'open' ? 'default' : 'secondary'}>
                            {trade.status === 'open' ? 'Offen' : 'Geschlossen'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={trade.side === TradeSide.LONG ? "default" : "secondary"}>
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {trade.broker || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>{trade.shares}</TableCell>

                        {/* Einstieg Group */}
                        <TableCell className="text-sm">
                          {formatDateSafe(trade.entryDate, 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(trade.entryPrice)}
                        </TableCell>

                        {/* Ausstieg Group */}
                        <TableCell className="text-sm">
                          {formatDateSafe(trade.exitDate, 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {trade.exitPrice
                            ? formatCurrency(trade.exitPrice)
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>

                        {/* Kosten & Steuer */}
                        <TableCell className="text-xs font-mono">
                          {formatCurrency(trade.fee || 0)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {trade.tax !== undefined && trade.tax < 0 ? (
                            <span className="text-emerald-600 font-medium" title="Steuererstattung (wird zum Nettoergebnis addiert)">
                              +{formatCurrency(Math.abs(trade.tax))}
                            </span>
                          ) : (
                            formatCurrency(trade.tax || 0)
                          )}
                        </TableCell>

                        {/* Rendite Group */}
                        <TableCell>
                          {isClosed && netPnl !== undefined ? (
                            <div className={`font-bold text-sm ${
                              netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {formatCurrency(netPnl)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isClosed && trade.pnl !== undefined ? (
                            <div className="text-xs">
                              <span className={`font-medium ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(trade.pnl)}
                              </span>
                              {trade.pnlPercent !== undefined && (
                                <span className="text-muted-foreground ml-1">
                                  ({formatPercent(trade.pnlPercent)})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
