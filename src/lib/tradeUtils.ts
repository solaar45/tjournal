import { Trade, TradeStats, TradeType, TradeSide } from '@/types/trade';
import { format } from 'date-fns';
import { enUS, de } from 'date-fns/locale';

/**
 * Berechnet P&L (Profit & Loss) für einen Trade
 */
export function calculatePnL(trade: Trade): Trade {
  if (!trade.exitPrice || !trade.exitDate) {
    return trade;
  }

  // Use exitShares if available, otherwise fall back to entryShares for full exit
  const exitShares = trade.exitShares ?? trade.entryShares ?? trade.shares;
  
  // For derivatives (Zertifikat, Optionsschein), the certificate itself is bought long and sold.
  // The certificate price movement already reflects the underlying direction (e.g. Short Turbo rises when underlying drops).
  // Therefore, (exitPrice - entryPrice) is always the return.
  // Only for direct short selling (Aktie / Krypto where the security was shorted at entry and covered at exit)
  // does the inverted multiplier apply.
  const isDerivative = trade.type === TradeType.ZERTIFIKAT || trade.type === TradeType.OPTIONSSCHEIN;
  const isDirectShort = !isDerivative && (trade.side === TradeSide.SHORT || (trade.side as string) === 'Short');
  const multiplier = isDirectShort ? -1 : 1;

  const pnl = (trade.exitPrice - trade.entryPrice) * exitShares * multiplier;
  const pnlPercent = trade.entryPrice > 0
    ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier
    : 0;
  const fee = trade.fee || 0;
  const tax = trade.tax || 0;
  const netPnl = pnl - fee - tax;

  return {
    ...trade,
    pnl: Number(pnl.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
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
  const totalNetPnL = closedTrades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)), 0);
  const totalFees = trades.reduce((sum, t) => sum + (t.fee || 0), 0);
  const totalTax = trades.reduce((sum, t) => sum + (t.tax || 0), 0);
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
    totalNetPnL: Number(totalNetPnL.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
  };
}

/**
 * Formatiert einen Geldbetrag (Standard: englische Finanzformatierung €1,234.56)
 */
export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formatiert Steuern:
 * - Steuerrückzahlungen (negativer Wert im Datenmodell, z.B. -8.37) -> positives Vorzeichen (+€8.37)
 * - Steuerzahlungen (positiver Wert im Datenmodell, z.B. 25.00) -> negatives Vorzeichen (-€25.00)
 * - 0 oder undefined -> neutral (€0.00 oder fallback)
 */
export function formatTax(tax?: number | null, locale: string = 'en-US', fallback: string = '-'): string {
  if (tax === undefined || tax === null) return fallback;
  if (tax === 0) return formatCurrency(0, locale);
  if (tax < 0) {
    return `+${formatCurrency(Math.abs(tax), locale)}`;
  }
  return `-${formatCurrency(Math.abs(tax), locale)}`;
}

/**
 * Formatiert einen Prozentsatz
 */
export function formatPercent(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Sicherer Datumsformatierer, der niemals einen RangeError wirft (Standard: MMM dd, yyyy)
 */
export function formatDateSafe(
  dateVal?: string | Date | null,
  formatStr: string = 'MMM dd, yyyy',
  fallback: string = '-',
  localeObj = enUS
): string {
  if (!dateVal) return fallback;
  try {
    let d: Date;
    if (dateVal instanceof Date) {
      d = dateVal;
    } else {
      let str = String(dateVal).trim();
      // Falls deutsches Format: DD.MM.YYYY [HH:mm[:ss]]
      if (/^\d{1,2}\.\d{1,2}\.\d{2,4}/.test(str)) {
        const parts = str.split(/[ T]/);
        const dateParts = parts[0].split('.');
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        let year = dateParts[2];
        if (year.length === 2) year = '20' + year;
        const timePart = parts[1] ? (parts[1].split(':').length === 2 ? `${parts[1]}:00` : parts[1]) : '00:00:00';
        str = `${year}-${month}-${day}T${timePart}`;
      }
      d = new Date(str);
    }
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr, { locale: localeObj });
  } catch {
    return fallback;
  }
}
