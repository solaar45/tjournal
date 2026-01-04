import { NextResponse } from 'next/server';
import { UpdateTradeDto } from '@/types/trade';
import { tradesStore } from '@/lib/tradesStore';

/**
 * GET /api/trades/:id - Einzelnen Trade abrufen
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await new Promise(resolve => setTimeout(resolve, 200));

  const trade = tradesStore.getById(id);

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

    const updatedTrade = tradesStore.update(id, body);

    if (!updatedTrade) {
      return NextResponse.json(
        { error: 'Trade nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTrade);
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

  const success = tradesStore.delete(id);

  if (!success) {
    return NextResponse.json(
      { error: 'Trade nicht gefunden' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: 'Trade gelöscht' });
}
