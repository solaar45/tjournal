import { NextResponse } from 'next/server';
import { calculateTradeStats, calculatePnL } from '@/lib/tradeUtils';
import mockTradesData from '@/data/mockTrades.json';

/**
 * GET /api/trades/stats - Statistiken aller Trades
 */
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 250));

  const trades = mockTradesData.map(calculatePnL);
  const stats = calculateTradeStats(trades);

  return NextResponse.json(stats);
}
