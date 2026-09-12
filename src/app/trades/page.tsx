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
import { formatCurrency } from '@/lib/tradeUtils';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.tradesPage.title}</h1>
          <p className="text-muted-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.tradesPage.totalTrades}</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.tradesPage.openTrades}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.tradesPage.closedTrades}</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.tradesPage.totalPnL}</CardDescription>
            <CardTitle
              className={`text-2xl ${
                stats.totalNetPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(stats.totalNetPnL, locale)} <span className="text-xs font-normal text-muted-foreground">{t.common.net}</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {t.common.gross}: {formatCurrency(stats.totalPnL, locale)} ({t.common.fees}: {formatCurrency(stats.totalFees, locale)} | {t.common.taxes}: {formatCurrency(stats.totalTax, locale)})
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Position Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">{t.tradesPage.tableTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">
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

      {/* Feature Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">⚡ Neue Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Kompakte Ansicht:</strong> Details nur bei Bedarf durch Expand/Collapse</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Sortierung:</strong> Click auf Symbol, Preis oder P/L um zu sortieren</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Schneller Überblick:</strong> Alle wichtigen Metriken auf einen Blick</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">➜</span>
              <span><strong>Bald:</strong> Multiple Entries/Exits pro Trade, Filterung, Export</span>
            </li>
          </ul>
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
