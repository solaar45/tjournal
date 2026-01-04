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
      pnlPercent: trade.pnlPercent,
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
  const unrealizedPnL = 0; // Would need current price for this
  const totalPnL = realizedPnL + unrealizedPnL;
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
    realizedPnL,
    unrealizedPnL,
    totalPnL,
    totalPnLPercent,
    transactions,
    firstEntryDate: trade.entryDate,
    lastExitDate: trade.exitDate,
    createdAt: trade.createdAt || new Date().toISOString(),
    updatedAt: trade.updatedAt || new Date().toISOString(),
  };
}

export default function TradesPage() {
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
    if (!trades) return { total: 0, open: 0, closed: 0, totalPnL: 0 };
    
    return {
      total: trades.length,
      open: trades.filter((t) => t.status === 'open').length,
      closed: trades.filter((t) => t.status === 'closed').length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
    };
  }, [trades]);

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
            Verwalte und analysiere deine {stats.total} Trades
          </p>
        </div>
        <div className="flex gap-2">
          <QuickTradeForm />
          <TradeForm />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offen [O]</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Geschlossen [C]</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt P/L</CardDescription>
            <CardTitle
              className={`text-3xl ${
                stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.totalPnL.toFixed(0)} €
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Position Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Trade Übersicht</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Klicke auf eine Zeile, um Entry/Exit Details anzuzeigen. Sortiere durch Click auf Spalten-Header.
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
