import { NextResponse } from 'next/server';
import { UpdateTradeDto } from '@/types/trade';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mapRowToTrade, mapUpdateDtoToRow, TradeRow } from '@/lib/supabase/mapper';

/**
 * GET /api/trades/:id - Einzelnen Trade abrufen
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Supabase GET /api/trades/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Trade nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapRowToTrade(data as TradeRow));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Serverfehler' }, { status: 500 });
  }
}

/**
 * PATCH /api/trades/:id - Trade aktualisieren
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTradeDto = await request.json();

    const updatePayload = mapUpdateDtoToRow(body);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('trades')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(`Supabase PATCH /api/trades/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Trade nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapRowToTrade(data as TradeRow));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Ungültige Daten' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/trades/:id - Trade löschen
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase DELETE /api/trades/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Trade gelöscht' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Serverfehler' }, { status: 500 });
  }
}
