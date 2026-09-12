"use client";

import { useState, useMemo } from 'react';
import { useTrades, useDeleteTrade } from '@/hooks/useTrades';
import { Trade } from '@/types/trade';
import { Position, Transaction, TransactionType, PositionStatus } from '@/types/position';
import { PositionTableTanstack } from '@/components/position-table-tanstack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TradeForm } from '@/components/trade-form';
import { QuickTradeForm } from '@/components/quick-trade-form';
import { EditTradeDialog } from '@/components/edit-trade-dialog';
import { CsvImportDialog } from '@/components/csv-import-dialog';

/**
 * Convert Trade to Position format for display
 * Single trades become positions with 1-2 transactions (entry + optional exit)
 */
function tradeToPosition(trade: Trade): Position {
  const transactions: Transaction[] = [];
  
  // Entry transaction
  const entryShares = trade.entryShares || trade.shares;
  transactions.push({
    id: `${trade.id}-entry`,
    positionId: trade.id,
    type: TransactionType.ENTRY,
    date: trade.entryDate,
    shares: entryShares,
    price: trade.entryPrice,
    value: entryShares * trade.entryPrice,
    positionAvgPrice: trade.entryPrice,
    positionTotalShares: entryShares,
  });

  // Exit transaction (if exists)
  const exitShares = trade.exitShares || 0;
  if (trade.exitDate && trade.exitPrice && exitShares > 0) {
    transactions.push({
      id: `${trade.id}-exit`,
      positionId: trade.id,
      type: TransactionType.EXIT,
      date: trade.exitDate,
      shares: exitShares,
      price: trade.exitPrice,
      value: exitShares * trade.exitPrice,
      pnl: trade.pnl,
      netPnl: trade.netPnl,
      pnlPercent: trade.pnlPercent,
      fee: trade.fee,
      tax: trade.tax,
      positionAvgPrice: trade.entryPrice,
      positionTotalShares: entryShares - exitShares,
    });
  }

  // Determine status
  let status: PositionStatus;
  if (exitShares === 0) {
    status = PositionStatus.OPEN;
  } else if (exitShares < entryShares) {
    status = PositionStatus.PARTIAL;
  } else {
    status = PositionStatus.CLOSED;
  }

  const remainingShares = entryShares - exitShares;
  const totalEntryValue = entryShares * trade.entryPrice;
  const totalExitValue = exitShares * (trade.exitPrice || 0);
  const realizedPnL = trade.pnl || 0;
  const realizedNetPnL = trade.netPnl !== undefined ? trade.netPnl : realizedPnL;
  const unrealizedPnL = 0; // Would need current price for this
  const totalPnL = realizedPnL + unrealizedPnL;
  const totalNetPnL = realizedNetPnL + unrealizedPnL;
  const totalPnLPercent = trade.pnlPercent || 0;

  return {
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    side: trade.side,
    broker: trade.broker,
    status,
    totalEntryShares: entryShares,
    totalExitShares: exitShares,
    remainingShares,
    avgEntryPrice: trade.entryPrice,
    avgExitPrice: trade.exitPrice,
    totalEntryValue,
    totalExitValue,
    fee: trade.fee,
    tax: trade.tax,
    realizedPnL,
    realizedNetPnL,
    unrealizedPnL,
    totalPnL,
    totalNetPnL,
    totalPnLPercent,
    transactions,
    firstEntryDate: trade.entryDate,
    lastExitDate: trade.exitDate,
    createdAt: trade.createdAt || new Date().toISOString(),
    updatedAt: trade.updatedAt || new Date().toISOString(),
  };
}

import { useTranslation } from '@/i18n/LanguageContext';
import {
  formatCurrency,
  formatSignedCurrency,
  formatTax,
  getAmountColorClass,
  getTaxColorClass,
} from '@/lib/tradeUtils';

export default function TradesPage() {
  const { t, locale } = useTranslation();
  const { data: trades, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Convert trades to positions for display
  const positions = useMemo(() => {
    if (!trades) return [];
    return trades.map(tradeToPosition);
  }, [trades]);

  // Stats
  const stats = useMemo(() => {
    if (!trades) return { total: 0, open: 0, closed: 0, totalPnL: 0, totalNetPnL: 0, totalFees: 0, totalTax: 0 };
    
    return {
      total: trades.length,
      open: trades.filter((t) => t.status === 'open').length,
      closed: trades.filter((t) => t.status === 'closed').length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      totalNetPnL: trades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)), 0),
      totalFees: trades.reduce((sum, t) => sum + (t.fee || 0), 0),
      totalTax: trades.reduce((sum, t) => sum + (t.tax || 0), 0),
    };
  }, [trades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t.tradesPage.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.tradesPage.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CsvImportDialog />
          <QuickTradeForm />
          <TradeForm />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-card border-border/70 shadow-eggplore hover:shadow-eggplore-card transition-all">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t.tradesPage.totalTrades}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {stats.total}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
            {stats.closed} {t.common.closed} · {stats.open} {t.common.open}
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/70 shadow-eggplore hover:shadow-eggplore-card transition-all">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t.tradesPage.openTrades}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#6979F8]">
            {stats.open}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Active positions
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/70 shadow-eggplore hover:shadow-eggplore-card transition-all">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t.tradesPage.closedTrades}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {stats.closed}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Completed trades
          </div>
        </Card>

        <Card className="p-4 bg-card border-border/70 shadow-eggplore hover:shadow-eggplore-card transition-all">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t.tradesPage.totalPnL} (NET)
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight ${getAmountColorClass(stats.totalNetPnL)}`}
          >
            {formatSignedCurrency(stats.totalNetPnL, locale)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono flex flex-wrap gap-x-2">
            <span>
              {t.common.gross}: <span className={getAmountColorClass(stats.totalPnL)}>{formatSignedCurrency(stats.totalPnL, locale)}</span>
            </span>
            <span>
              {t.common.tax}: <span className={getTaxColorClass(stats.totalTax)}>{formatTax(stats.totalTax, locale)}</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Position Table */}
      <Card className="border-border/70 bg-card shadow-eggplore overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 sm:p-6 border-b border-border/60">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">{t.tradesPage.tableTitle}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.tradesPage.tableSubtitle}
            </p>
          </div>
          <div className="p-6">
            <PositionTableTanstack
              positions={positions}
              onEdit={(position) => {
                // Find original trade
                const trade = trades?.find((t) => t.id === position.id);
                if (trade) setEditingTrade(trade);
              }}
              onAddTransaction={(id) => {
                console.log('Add transaction to:', id);
                // Future: Add transaction dialog
              }}
              onDelete={(position) => {
                if (window.confirm(`${t.tradesPage.confirmDelete} (${position.symbol})`)) {
                  deleteTrade.mutate(position.id);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>


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
