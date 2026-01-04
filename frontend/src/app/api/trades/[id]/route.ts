import { NextResponse } from 'next/server';
import { Trade, UpdateTradeDto } from '@/types/trade';
import { calculatePnL } from '@/lib/tradeUtils';
import mockTradesData from '@/data/mockTrades.json';

// In-Memory Store (shared mit route.ts über Module-Scope)
let trades: Trade[] = mockTradesData.map(calculatePnL);

/**
 * GET /api/trades/:id - Einzelnen Trade abrufen
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise(resolve => setTimeout(resolve, 200));

  const trade = trades.find(t => t.id === id);

  if (!trade) {
    return NextResponse.json(
      { error: 'Trade nicht gefunden' },
      { status: 404 }
    );
  }

  return NextResponse.json(trade);
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

    await new Promise(resolve => setTimeout(resolve, 400));

    const tradeIndex = trades.findIndex(t => t.id === id);

    if (tradeIndex === -1) {
      return NextResponse.json(
        { error: 'Trade nicht gefunden' },
        { status: 404 }
      );
    }

    const updatedTrade: Trade = {
      ...trades[tradeIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    trades[tradeIndex] = calculatePnL(updatedTrade);

    return NextResponse.json(trades[tradeIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ungültige Daten' },
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
  const { id } = await params;
  await new Promise(resolve => setTimeout(resolve, 300));

  const tradeIndex = trades.findIndex(t => t.id === id);

  if (tradeIndex === -1) {
    return NextResponse.json(
      { error: 'Trade nicht gefunden' },
      { status: 404 }
    );
  }

  trades.splice(tradeIndex, 1);

  return NextResponse.json({ success: true, message: 'Trade gelöscht' });
}
