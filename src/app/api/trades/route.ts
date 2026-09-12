import { NextResponse } from 'next/server';
import { CreateTradeDto } from '@/types/trade';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mapRowToTrade, mapCreateDtoToRow, TradeRow } from '@/lib/supabase/mapper';

/**
 * GET /api/trades - Alle Trades abrufen (mit optionalen Filtern)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from('trades')
      .select('*')
      .order('entry_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase GET /api/trades error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const trades = ((data as TradeRow[]) || []).map(mapRowToTrade);
    return NextResponse.json(trades);
  } catch (err: any) {
    console.error('API Error in GET /api/trades:', err);
    return NextResponse.json({ error: err?.message || 'Serverfehler' }, { status: 500 });
  }
}

/**
 * POST /api/trades - Neuen Trade erstellen
 */
export async function POST(request: Request) {
  try {
    const body: CreateTradeDto = await request.json();

    // Validierung - prüfe auf erforderliche Felder
    if (!body.symbol || !body.type || !body.side || !body.entryPrice || !body.entryShares || !body.entryDate) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: symbol, type, side, entryPrice, entryShares, entryDate sind erforderlich' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const insertPayload = mapCreateDtoToRow(body);

    const { data, error } = await supabase
      .from('trades')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase POST /api/trades error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const createdTrade = mapRowToTrade(data as TradeRow);
    return NextResponse.json(createdTrade, { status: 201 });
  } catch (error: any) {
    console.error('API Error in POST /api/trades:', error);
    return NextResponse.json(
      { error: error?.message || 'Ungültige Daten' },
      { status: 400 }
    );
  }
}
