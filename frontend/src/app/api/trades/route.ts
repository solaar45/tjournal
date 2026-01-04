import { NextResponse } from 'next/server';
import { Trade, CreateTradeDto } from '@/types/trade';
import { calculatePnL } from '@/lib/tradeUtils';
import mockTradesData from '@/data/mockTrades.json';

// In-Memory Store (wird bei jedem Server-Neustart zurückgesetzt)
// In Production: Durch Datenbank ersetzen
let trades: Trade[] = mockTradesData.map(calculatePnL);

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

  let filteredTrades = [...trades];

  // Filtern nach Status
  if (status) {
    filteredTrades = filteredTrades.filter(t => t.status === status);
  }

  // Filtern nach Typ
  if (type) {
    filteredTrades = filteredTrades.filter(t => t.type === type);
  }

  // Sortieren nach Datum (neueste zuerst)
  filteredTrades.sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );

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

    const tradeWithPnL = calculatePnL(newTrade);
    trades.push(tradeWithPnL);

    return NextResponse.json(tradeWithPnL, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ungültige Daten' },
      { status: 400 }
    );
  }
}
