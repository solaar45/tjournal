import { NextResponse } from 'next/server';
import { calculateTradeStats } from '@/lib/tradeUtils';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mapRowToTrade, TradeRow } from '@/lib/supabase/mapper';

/**
 * GET /api/trades/stats - Statistiken aller Trades dynamisch aus Supabase berechnen
 */
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('trades')
      .select('*');

    if (error) {
      console.error('Supabase GET /api/trades/stats error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const trades = ((data as TradeRow[]) || []).map(mapRowToTrade);
    const stats = calculateTradeStats(trades);

    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('API Error in GET /api/trades/stats:', err);
    return NextResponse.json({ error: err?.message || 'Serverfehler' }, { status: 500 });
  }
}
