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
import { useTranslation } from '@/i18n/LanguageContext';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { t, locale, language } = useTranslation();
  const dateFormat = language === 'de' ? 'dd.MM.yy' : 'MM/dd/yy';
  const { data: trades, isLoading: tradesLoading, error: tradesError } = useTrades();
  const { data: stats, isLoading: statsLoading, error: statsError } = useTradeStats();

  // Loading State
  if (tradesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (tradesError || statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            {tradesError?.message || statsError?.message}
          </p>
        </div>
      </div>
    );
  }

  // Recent Trades (5 most recent)
  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.navigation.dashboard}</h1>
          <p className="text-muted-foreground">
            {t.navigation.tagline}
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
              {t.dashboard.totalPnLNet}
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
              {formatCurrency(stats?.totalNetPnL !== undefined ? stats.totalNetPnL : (stats?.totalPnL || 0), locale)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
              <span>{t.common.gross}: {formatCurrency(stats?.totalPnL || 0, locale)}</span>
              {(stats?.totalFees || stats?.totalTax) ? (
                <span>({t.common.fee}: {formatCurrency(stats?.totalFees || 0, locale)}, {t.common.tax}: {formatCurrency(stats?.totalTax || 0, locale)})</span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.winRate}
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
              {t.dashboard.avgWinRateDesc} ({stats?.closedTrades || 0} {t.dashboard.closedTradesCount})
            </p>
          </CardContent>
        </Card>

        {/* Open Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.openTrades}
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
              Active open positions
            </p>
          </CardContent>
        </Card>

        {/* Total Trades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.totalTrades}
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
              All logged trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Highlights</CardTitle>
            <CardDescription>
              Largest and average win/loss metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Largest Win</span>
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(stats?.largestWin || 0, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Largest Loss</span>
              <span className="text-sm font-medium text-rose-600">
                {formatCurrency(stats?.largestLoss || 0, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">Average Win</span>
              <span className="text-sm font-medium">
                {formatCurrency(stats?.avgWin || 0, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Loss</span>
              <span className="text-sm font-medium">
                {formatCurrency(stats?.avgLoss || 0, locale)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.distributionByType}</CardTitle>
            <CardDescription>
              Breakdown by position status and asset class
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.common.closed}</span>
              <span className="text-sm font-medium">
                {stats?.closedTrades || 0} {t.common.trades}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.common.open}</span>
              <span className="text-sm font-medium">
                {stats?.openTrades || 0} {t.common.trades}
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{t.dashboard.recentTrades}</CardTitle>
            <CardDescription className="mt-1">
              {t.dashboard.recentTradesDesc}
            </CardDescription>
          </div>
          <Link href="/trades">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>{t.common.trades}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t.dashboard.noTradesYet}</p>
              <TradeForm trigger={<Button>{t.dashboard.createFirstTrade}</Button>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {/* Main Header Row */}
                  <TableRow>
                    <TableHead colSpan={6} className="text-center bg-slate-50 dark:bg-slate-900 font-semibold">{t.dashboard.infoGroup}</TableHead>
                    <TableHead colSpan={2} className="text-center bg-blue-50 dark:bg-blue-950/40 font-semibold">{t.dashboard.entryGroup}</TableHead>
                    <TableHead colSpan={2} className="text-center bg-amber-50 dark:bg-amber-950/40 font-semibold">{t.dashboard.exitGroup}</TableHead>
                    <TableHead colSpan={2} className="text-center bg-purple-50 dark:bg-purple-950/40 font-semibold">{t.dashboard.costsGroup}</TableHead>
                    <TableHead colSpan={2} className="text-center bg-green-50 dark:bg-green-950/40 font-semibold">{t.dashboard.returnGroup}</TableHead>
                  </TableRow>
                  {/* Sub-Header Row */}
                  <TableRow className="border-b text-xs">
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.symbol}</TableHead>
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.type}</TableHead>
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.status}</TableHead>
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.side}</TableHead>
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.broker}</TableHead>
                    <TableHead className="bg-slate-50 dark:bg-slate-900">{t.common.shares}</TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950/40">{t.common.date}</TableHead>
                    <TableHead className="bg-blue-50 dark:bg-blue-950/40">{t.common.price}</TableHead>
                    <TableHead className="bg-amber-50 dark:bg-amber-950/40">{t.common.date}</TableHead>
                    <TableHead className="bg-amber-50 dark:bg-amber-950/40">{t.common.price}</TableHead>
                    <TableHead className="bg-purple-50 dark:bg-purple-950/40">{t.common.fee}</TableHead>
                    <TableHead className="bg-purple-50 dark:bg-purple-950/40">{t.common.tax}</TableHead>
                    <TableHead className="bg-green-50 dark:bg-green-950/40">Net P&L</TableHead>
                    <TableHead className="bg-green-50 dark:bg-green-950/40 text-right">Gross P&L (%)</TableHead>
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
                            {trade.status === 'open' ? t.common.open : t.common.closed}
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

                        {/* Entry Group */}
                        <TableCell className="text-sm">
                          {formatDateSafe(trade.entryDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(trade.entryPrice, locale)}
                        </TableCell>

                        {/* Exit Group */}
                        <TableCell className="text-sm">
                          {formatDateSafe(trade.exitDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {trade.exitPrice
                            ? formatCurrency(trade.exitPrice, locale)
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>

                        {/* Costs & Tax */}
                        <TableCell className="text-xs font-mono">
                          {formatCurrency(trade.fee || 0, locale)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {trade.tax !== undefined && trade.tax < 0 ? (
                            <span className="text-emerald-600 font-medium" title={t.common.taxCredit}>
                              +{formatCurrency(Math.abs(trade.tax), locale)}
                            </span>
                          ) : (
                            formatCurrency(trade.tax || 0, locale)
                          )}
                        </TableCell>

                        {/* Return Group */}
                        <TableCell>
                          {isClosed && netPnl !== undefined ? (
                            <div className={`font-bold text-sm ${
                              netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {formatCurrency(netPnl, locale)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isClosed && trade.pnl !== undefined ? (
                            <div className="text-xs">
                              <span className={`font-medium ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(trade.pnl, locale)}
                              </span>
                              {trade.pnlPercent !== undefined && (
                                <span className="text-muted-foreground ml-1">
                                  ({formatPercent(trade.pnlPercent, locale)})
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
