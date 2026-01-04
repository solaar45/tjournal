import { NextResponse } from 'next/server';
import { Trade, CreateTradeDto } from '@/types/trade';
import { tradesStore } from '@/lib/tradesStore';

/**
 * GET /api/trades - Alle Trades abrufen
 */
export async function GET(request: Request) {
  // URL-Parameter parsen (für zukünftige Filterung)
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  // Simuliere Netzwerk-Delay für Realismus
  await new Promise(resolve => setTimeout(resolve, 300));

  const filteredTrades = tradesStore.filter({
    status: status || undefined,
    type: type || undefined,
  });

  return NextResponse.json(filteredTrades);
}

/**
 * POST /api/trades - Neuen Trade erstellen
 */
export async function POST(request: Request) {
  try {
    const body: CreateTradeDto = await request.json();

    // Validierung
    if (!body.symbol || !body.type || !body.shares || !body.entryPrice) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // Simuliere Netzwerk-Delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date().toISOString();
    const newTrade: Trade = {
      id: Date.now().toString(),
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const createdTrade = tradesStore.add(newTrade);

    return NextResponse.json(createdTrade, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ungültige Daten' },
      { status: 400 }
    );
  }
}
