import { Trade, TradeStats } from '@/types/trade';

/**
 * Berechnet P&L (Profit & Loss) für einen Trade
 */
export function calculatePnL(trade: Trade): Trade {
  if (!trade.exitPrice || !trade.exitDate) {
    return trade;
  }

  // Use exitShares if available, otherwise fall back to entryShares for full exit
  const exitShares = trade.exitShares ?? trade.entryShares ?? trade.shares;
  
  const multiplier = trade.side === 'Long' ? 1 : -1;
  const pnl = (trade.exitPrice - trade.entryPrice) * exitShares * multiplier;
  const pnlPercent = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;

  return {
    ...trade,
    pnl: Number(pnl.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
  };
}

/**
 * Berechnet Statistiken für eine Liste von Trades
 */
export function calculateTradeStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
  const openTrades = trades.filter(t => t.status === 'open');

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
    : 0;

  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length
    : 0;

  const largestWin = winningTrades.length > 0
    ? Math.max(...winningTrades.map(t => t.pnl || 0))
    : 0;

  const largestLoss = losingTrades.length > 0
    ? Math.min(...losingTrades.map(t => t.pnl || 0))
    : 0;

  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    totalPnL: Number(totalPnL.toFixed(2)),
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
  };
}

/**
 * Formatiert einen Geldbetrag
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formatiert einen Prozentsatz
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
