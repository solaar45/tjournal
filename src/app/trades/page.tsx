"use client";

import { useState, useMemo } from 'react';
import { useTrades, useDeleteTrade } from '@/hooks/useTrades';
import { Trade } from '@/types/trade';
import { Position, Transaction, TransactionType, PositionStatus } from '@/types/position';
import { PositionTableTanstack } from '@/components/position-table-tanstack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useTradeFilters } from '@/context/trade-filter-context';
import { FilterToolbar } from '@/components/dashboard/filter-toolbar';

export default function TradesPage() {
  const { t } = useTranslation();
  const { allTrades, filteredTrades, isLoading } = useTradeFilters();
  const deleteTrade = useDeleteTrade();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Convert filtered trades to positions for display
  const positions = useMemo(() => {
    return filteredTrades.map(tradeToPosition);
  }, [filteredTrades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-xs text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Universal Filter & Actions Header */}
      <FilterToolbar />

      {/* Position Table */}
      <Card className="border-border/70 bg-card shadow-eggplore overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 sm:p-5 border-b border-border/60">
            <h2 className="font-semibold text-base tracking-tight text-foreground">{t.tradesPage.tableTitle}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.tradesPage.tableSubtitle}
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <PositionTableTanstack
              positions={positions}
              onEdit={(position) => {
                const trade = allTrades.find((t) => t.id === position.id);
                if (trade) setEditingTrade(trade);
              }}
              onAddTransaction={(id) => {
                console.log('Add transaction to:', id);
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

