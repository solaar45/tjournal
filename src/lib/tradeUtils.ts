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
 * Formatiert einen Geldbetrag mit explizitem Vorzeichen (+ für positiv, - für negativ)
 */
export function formatSignedCurrency(amount?: number | null, locale: string = 'en-US', fallback: string = '-'): string {
  if (amount === undefined || amount === null) return fallback;
  if (amount > 0) {
    return `+${formatCurrency(amount, locale)}`;
  }
  if (amount < 0) {
    return `-${formatCurrency(Math.abs(amount), locale)}`;
  }
  return formatCurrency(0, locale);
}

/**
 * Formatiert einen Prozentsatz mit explizitem Vorzeichen (+ für positiv, - für negativ)
 */
export function formatSignedPercent(value?: number | null, locale: string = 'en-US', fallback: string = '-'): string {
  if (value === undefined || value === null) return fallback;
  if (value > 0) {
    return `+${formatPercent(value, locale)}`;
  }
  if (value < 0) {
    return `-${formatPercent(Math.abs(value), locale)}`;
  }
  return formatPercent(0, locale);
}

/**
 * Gibt die passende Farbklasse für Beträge zurück:
 * positiv -> text-emerald-600 dark:text-emerald-400 (Grün)
 * negativ -> text-rose-600 dark:text-rose-400 (Rot)
 * neutral -> text-muted-foreground
 */
export function getAmountColorClass(amount?: number | null): string {
  if (amount === undefined || amount === null || amount === 0) return 'text-muted-foreground';
  if (amount > 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-rose-600 dark:text-rose-400';
}

/**
 * Gibt die passende Farbklasse für Steuern zurück:
 * Steuerrückzahlung (tax < 0, z.B. +€8.37) -> Grün
 * Steuerzahlung (tax > 0, z.B. -€25.00) -> Rot
 * 0 oder undefined -> text-muted-foreground
 */
export function getTaxColorClass(tax?: number | null): string {
  if (tax === undefined || tax === null || tax === 0) return 'text-muted-foreground';
  if (tax < 0) return 'text-emerald-600 dark:text-emerald-400';
  return 'text-rose-600 dark:text-rose-400';
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

export interface StreakStats {
  bestWinStreak: number;
  currentWinStreak: number;
  maxLossStreak: number;
  currentLossStreak: number;
}

/**
 * Berechnet Gewinn- und Verlust-Serien (Streaks)
 */
export function calculateStreakStats(trades: Trade[]): StreakStats {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && (t.netPnl !== undefined || t.pnl !== undefined))
    .sort((a, b) => {
      const timeA = new Date(a.exitDate || a.entryDate).getTime();
      const timeB = new Date(b.exitDate || b.entryDate).getTime();
      return timeA - timeB;
    });

  let bestWinStreak = 0;
  let currentWinStreak = 0;
  let maxLossStreak = 0;
  let currentLossStreak = 0;

  for (const t of closedTrades) {
    const pnl = t.netPnl !== undefined ? t.netPnl : (t.pnl || 0);
    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > bestWinStreak) {
        bestWinStreak = currentWinStreak;
      }
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) {
        maxLossStreak = currentLossStreak;
      }
    }
  }

  return {
    bestWinStreak,
    currentWinStreak,
    maxLossStreak,
    currentLossStreak,
  };
}

export interface LongShortStats {
  long: { count: number; pnl: number; wins: number; winRate: number };
  short: { count: number; pnl: number; wins: number; winRate: number };
}

/**
 * Teilt Performance nach Long vs Short auf
 */
export function calculateLongShortStats(trades: Trade[]): LongShortStats {
  const closedTrades = trades.filter(t => t.status === 'closed' && (t.netPnl !== undefined || t.pnl !== undefined));

  const longTrades = closedTrades.filter(t => t.side === TradeSide.LONG || (t.side as string) === 'Long');
  const shortTrades = closedTrades.filter(t => t.side === TradeSide.SHORT || (t.side as string) === 'Short');

  const longPnl = longTrades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)), 0);
  const shortPnl = shortTrades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)), 0);

  const longWins = longTrades.filter(t => (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)) > 0).length;
  const shortWins = shortTrades.filter(t => (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)) > 0).length;

  return {
    long: {
      count: longTrades.length,
      pnl: Number(longPnl.toFixed(2)),
      wins: longWins,
      winRate: longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0,
    },
    short: {
      count: shortTrades.length,
      pnl: Number(shortPnl.toFixed(2)),
      wins: shortWins,
      winRate: shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0,
    },
  };
}

export interface DayCalendarData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  pnl: number;
  tradesCount: number;
  trades: Trade[];
}

export interface WeekCalendarRow {
  weekNumber: number;
  days: DayCalendarData[];
  weeklyPnl: number;
  weeklyTradesCount: number;
}

/**
 * Erstellt die Monatsraster-Daten für den Handelskalender (Mo-So mit Wochensummen)
 */
export function calculateDailyCalendarData(
  trades: Trade[],
  currentDate: Date = new Date()
): WeekCalendarRow[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Erster und letzter Tag des Monats
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Finde Montag vor oder am 1. des Monats (Mo = 1, So = 0)
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)
  // Differenz zu Montag (1)
  const daysBefore = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const calendarStartDate = new Date(year, month, 1 - daysBefore);

  // Finde Sonntag nach oder am letzten Tag des Monats
  const endDayOfWeek = lastDayOfMonth.getDay();
  const daysAfter = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  const calendarEndDate = new Date(year, month + 1, daysAfter);

  // Map von YYYY-MM-DD zu Trades
  const tradesByDay: Record<string, Trade[]> = {};
  trades.forEach(t => {
    const rawDate = t.exitDate || t.entryDate;
    if (!rawDate) return;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!tradesByDay[dateKey]) tradesByDay[dateKey] = [];
    tradesByDay[dateKey].push(t);
  });

  const weeks: WeekCalendarRow[] = [];
  let currentWeekDays: DayCalendarData[] = [];
  let currentIterDate = new Date(calendarStartDate);
  let weekIndex = 1;

  while (currentIterDate <= calendarEndDate) {
    const iterYear = currentIterDate.getFullYear();
    const iterMonth = currentIterDate.getMonth();
    const iterDay = currentIterDate.getDate();
    const dateStr = `${iterYear}-${String(iterMonth + 1).padStart(2, '0')}-${String(iterDay).padStart(2, '0')}`;
    const dayTrades = tradesByDay[dateStr] || [];

    const dayClosedTrades = dayTrades.filter(t => t.status === 'closed');
    const dayPnl = dayClosedTrades.reduce((sum, t) => sum + (t.netPnl !== undefined ? t.netPnl : (t.pnl || 0)), 0);

    currentWeekDays.push({
      date: new Date(currentIterDate),
      dateStr,
      dayNumber: iterDay,
      isCurrentMonth: iterMonth === month,
      pnl: Number(dayPnl.toFixed(2)),
      tradesCount: dayTrades.length,
      trades: dayTrades,
    });

    if (currentWeekDays.length === 7) {
      const weeklyPnl = currentWeekDays.reduce((sum, d) => sum + (d.isCurrentMonth ? d.pnl : 0), 0);
      const weeklyTradesCount = currentWeekDays.reduce((sum, d) => sum + (d.isCurrentMonth ? d.tradesCount : 0), 0);
      weeks.push({
        weekNumber: weekIndex++,
        days: currentWeekDays,
        weeklyPnl: Number(weeklyPnl.toFixed(2)),
        weeklyTradesCount,
      });
      currentWeekDays = [];
    }

    currentIterDate.setDate(currentIterDate.getDate() + 1);
  }

  return weeks;
}

export interface EquityPoint {
  date: string;
  dateLabel: string;
  cumulativePnl: number;
  drawdown: number;
}

/**
 * Berechnet die kumulative P&L-Kurve und Drawdown über die Zeit
 */
export function calculateEquityCurve(trades: Trade[]): EquityPoint[] {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && (t.netPnl !== undefined || t.pnl !== undefined))
    .sort((a, b) => {
      const timeA = new Date(a.exitDate || a.entryDate).getTime();
      const timeB = new Date(b.exitDate || b.entryDate).getTime();
      return timeA - timeB;
    });

  if (closedTrades.length === 0) {
    return [
      { date: new Date().toISOString(), dateLabel: 'Start', cumulativePnl: 0, drawdown: 0 }
    ];
  }

  const points: EquityPoint[] = [
    { date: closedTrades[0].entryDate, dateLabel: 'Start', cumulativePnl: 0, drawdown: 0 }
  ];

  let cumulativePnl = 0;
  let peakPnl = 0;

  closedTrades.forEach((t) => {
    const pnl = t.netPnl !== undefined ? t.netPnl : (t.pnl || 0);
    cumulativePnl = Number((cumulativePnl + pnl).toFixed(2));
    if (cumulativePnl > peakPnl) {
      peakPnl = cumulativePnl;
    }
    const drawdown = Number((cumulativePnl - peakPnl).toFixed(2));
    const rawDate = t.exitDate || t.entryDate;
    const d = new Date(rawDate);
    const dateLabel = isNaN(d.getTime()) ? '-' : format(d, 'MMM dd');

    points.push({
      date: rawDate,
      dateLabel,
      cumulativePnl,
      drawdown,
    });
  });

  return points;
}
