"use client";

import { Position, TransactionType, PositionStatus } from '@/types/position';
import { TradeType, TradeSide } from '@/types/trade';
import { PositionTableTanstack } from '@/components/position-table-tanstack';

// Mock Data - Same scenarios
const mockPositions: Position[] = [
  {
    id: 'pos-1',
    symbol: 'AAPL',
    type: TradeType.AKTIE,
    side: TradeSide.LONG,
    status: PositionStatus.PARTIAL,
    totalEntryShares: 180,
    totalExitShares: 80,
    remainingShares: 100,
    avgEntryPrice: 152.67,
    avgExitPrice: 167.5,
    totalEntryValue: 27490,
    totalExitValue: 13400,
    realizedPnL: 1145,
    unrealizedPnL: 2233,
    totalPnL: 3378,
    totalPnLPercent: 12.3,
    transactions: [
      {
        id: 'txn-1',
        positionId: 'pos-1',
        type: TransactionType.ENTRY,
        date: '2026-01-04T09:30:00Z',
        shares: 100,
        price: 150.0,
        value: 15000,
        positionAvgPrice: 150.0,
        positionTotalShares: 100,
      },
      {
        id: 'txn-2',
        positionId: 'pos-1',
        type: TransactionType.ENTRY,
        date: '2026-01-05T10:15:00Z',
        shares: 50,
        price: 155.0,
        value: 7750,
        positionAvgPrice: 151.67,
        positionTotalShares: 150,
      },
      {
        id: 'txn-3',
        positionId: 'pos-1',
        type: TransactionType.ENTRY,
        date: '2026-01-06T11:00:00Z',
        shares: 30,
        price: 158.0,
        value: 4740,
        positionAvgPrice: 152.67,
        positionTotalShares: 180,
      },
      {
        id: 'txn-4',
        positionId: 'pos-1',
        type: TransactionType.EXIT,
        date: '2026-01-08T14:30:00Z',
        shares: 50,
        price: 165.0,
        value: 8250,
        pnl: 625,
        pnlPercent: 8.2,
        positionAvgPrice: 152.67,
        positionTotalShares: 130,
      },
      {
        id: 'txn-5',
        positionId: 'pos-1',
        type: TransactionType.EXIT,
        date: '2026-01-09T13:00:00Z',
        shares: 30,
        price: 170.0,
        value: 5100,
        pnl: 520,
        pnlPercent: 11.3,
        positionAvgPrice: 152.67,
        positionTotalShares: 100,
      },
    ],
    firstEntryDate: '2026-01-04T09:30:00Z',
    lastExitDate: '2026-01-09T13:00:00Z',
    createdAt: '2026-01-04T09:30:00Z',
    updatedAt: '2026-01-09T13:00:00Z',
  },
  {
    id: 'pos-2',
    symbol: 'TSLA',
    type: TradeType.AKTIE,
    side: TradeSide.LONG,
    status: PositionStatus.PARTIAL,
    totalEntryShares: 50,
    totalExitShares: 35,
    remainingShares: 15,
    avgEntryPrice: 245.30,
    avgExitPrice: 268.43,
    totalEntryValue: 12265,
    totalExitValue: 9395,
    realizedPnL: 810,
    unrealizedPnL: 405,
    totalPnL: 1215,
    totalPnLPercent: 9.9,
    transactions: [
      {
        id: 'txn-6',
        positionId: 'pos-2',
        type: TransactionType.ENTRY,
        date: '2026-01-03T10:00:00Z',
        shares: 50,
        price: 245.30,
        value: 12265,
        positionAvgPrice: 245.30,
        positionTotalShares: 50,
      },
      {
        id: 'txn-7',
        positionId: 'pos-2',
        type: TransactionType.EXIT,
        date: '2026-01-05T11:30:00Z',
        shares: 20,
        price: 262.50,
        value: 5250,
        pnl: 344,
        pnlPercent: 7.0,
        positionAvgPrice: 245.30,
        positionTotalShares: 30,
      },
      {
        id: 'txn-8',
        positionId: 'pos-2',
        type: TransactionType.EXIT,
        date: '2026-01-08T15:00:00Z',
        shares: 15,
        price: 276.30,
        value: 4145,
        pnl: 466,
        pnlPercent: 12.6,
        positionAvgPrice: 245.30,
        positionTotalShares: 15,
      },
    ],
    firstEntryDate: '2026-01-03T10:00:00Z',
    lastExitDate: '2026-01-08T15:00:00Z',
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-01-08T15:00:00Z',
  },
  {
    id: 'pos-3',
    symbol: 'NVDA',
    type: TradeType.AKTIE,
    side: TradeSide.SHORT,
    status: PositionStatus.CLOSED,
    totalEntryShares: 100,
    totalExitShares: 100,
    remainingShares: 0,
    avgEntryPrice: 485.0,
    avgExitPrice: 465.5,
    totalEntryValue: 48500,
    totalExitValue: 46550,
    realizedPnL: 1950,
    unrealizedPnL: 0,
    totalPnL: 1950,
    totalPnLPercent: 4.0,
    transactions: [
      {
        id: 'txn-9',
        positionId: 'pos-3',
        type: TransactionType.ENTRY,
        date: '2026-01-02T09:00:00Z',
        shares: 100,
        price: 485.0,
        value: 48500,
        positionAvgPrice: 485.0,
        positionTotalShares: 100,
      },
      {
        id: 'txn-10',
        positionId: 'pos-3',
        type: TransactionType.EXIT,
        date: '2026-01-04T10:30:00Z',
        shares: 60,
        price: 470.0,
        value: 28200,
        pnl: 900,
        pnlPercent: 3.1,
        positionAvgPrice: 485.0,
        positionTotalShares: 40,
      },
      {
        id: 'txn-11',
        positionId: 'pos-3',
        type: TransactionType.EXIT,
        date: '2026-01-06T14:00:00Z',
        shares: 40,
        price: 458.75,
        value: 18350,
        pnl: 1050,
        pnlPercent: 5.4,
        positionAvgPrice: 485.0,
        positionTotalShares: 0,
      },
    ],
    firstEntryDate: '2026-01-02T09:00:00Z',
    lastExitDate: '2026-01-06T14:00:00Z',
    createdAt: '2026-01-02T09:00:00Z',
    updatedAt: '2026-01-06T14:00:00Z',
  },
  {
    id: 'pos-4',
    symbol: 'MSFT',
    type: TradeType.AKTIE,
    side: TradeSide.LONG,
    status: PositionStatus.OPEN,
    totalEntryShares: 75,
    totalExitShares: 0,
    remainingShares: 75,
    avgEntryPrice: 380.0,
    avgExitPrice: undefined,
    totalEntryValue: 28500,
    totalExitValue: 0,
    realizedPnL: 0,
    unrealizedPnL: 1125,
    totalPnL: 1125,
    totalPnLPercent: 3.9,
    transactions: [
      {
        id: 'txn-12',
        positionId: 'pos-4',
        type: TransactionType.ENTRY,
        date: '2026-01-07T11:00:00Z',
        shares: 75,
        price: 380.0,
        value: 28500,
        positionAvgPrice: 380.0,
        positionTotalShares: 75,
      },
    ],
    firstEntryDate: '2026-01-07T11:00:00Z',
    createdAt: '2026-01-07T11:00:00Z',
    updatedAt: '2026-01-07T11:00:00Z',
  },
  {
    id: 'pos-5',
    symbol: 'GOOGL',
    type: TradeType.AKTIE,
    side: TradeSide.LONG,
    status: PositionStatus.PARTIAL,
    totalEntryShares: 200,
    totalExitShares: 120,
    remainingShares: 80,
    avgEntryPrice: 142.50,
    avgExitPrice: 155.75,
    totalEntryValue: 28500,
    totalExitValue: 18690,
    realizedPnL: 1590,
    unrealizedPnL: 1200,
    totalPnL: 2790,
    totalPnLPercent: 9.8,
    transactions: [
      {
        id: 'txn-13',
        positionId: 'pos-5',
        type: TransactionType.ENTRY,
        date: '2026-01-01T09:00:00Z',
        shares: 50,
        price: 140.0,
        value: 7000,
        positionAvgPrice: 140.0,
        positionTotalShares: 50,
      },
      {
        id: 'txn-14',
        positionId: 'pos-5',
        type: TransactionType.ENTRY,
        date: '2026-01-02T10:00:00Z',
        shares: 40,
        price: 142.0,
        value: 5680,
        positionAvgPrice: 140.89,
        positionTotalShares: 90,
      },
      {
        id: 'txn-15',
        positionId: 'pos-5',
        type: TransactionType.ENTRY,
        date: '2026-01-03T11:00:00Z',
        shares: 60,
        price: 144.0,
        value: 8640,
        positionAvgPrice: 142.13,
        positionTotalShares: 150,
      },
      {
        id: 'txn-16',
        positionId: 'pos-5',
        type: TransactionType.ENTRY,
        date: '2026-01-04T12:00:00Z',
        shares: 50,
        price: 143.6,
        value: 7180,
        positionAvgPrice: 142.50,
        positionTotalShares: 200,
      },
      {
        id: 'txn-17',
        positionId: 'pos-5',
        type: TransactionType.EXIT,
        date: '2026-01-05T14:00:00Z',
        shares: 40,
        price: 152.0,
        value: 6080,
        pnl: 380,
        pnlPercent: 6.7,
        positionAvgPrice: 142.50,
        positionTotalShares: 160,
      },
      {
        id: 'txn-18',
        positionId: 'pos-5',
        type: TransactionType.EXIT,
        date: '2026-01-06T15:00:00Z',
        shares: 30,
        price: 156.0,
        value: 4680,
        pnl: 405,
        pnlPercent: 9.5,
        positionAvgPrice: 142.50,
        positionTotalShares: 130,
      },
      {
        id: 'txn-19',
        positionId: 'pos-5',
        type: TransactionType.EXIT,
        date: '2026-01-07T16:00:00Z',
        shares: 50,
        price: 158.6,
        value: 7930,
        pnl: 805,
        pnlPercent: 11.3,
        positionAvgPrice: 142.50,
        positionTotalShares: 80,
      },
    ],
    firstEntryDate: '2026-01-01T09:00:00Z',
    lastExitDate: '2026-01-07T16:00:00Z',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-07T16:00:00Z',
  },
];

export default function TanstackDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          TanStack Table Demo ⚡
        </h1>
        <p className="text-muted-foreground">
          Professionelle Data Table mit Sortierung, Expand/Collapse und kompaktem Design
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Positionen</p>
          <p className="text-2xl font-bold">{mockPositions.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Offen [O]</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockPositions.filter((p) => p.status === PositionStatus.OPEN).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Teilweise [P]</p>
          <p className="text-2xl font-bold text-amber-600">
            {mockPositions.filter((p) => p.status === PositionStatus.PARTIAL).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Geschlossen [C]</p>
          <p className="text-2xl font-bold text-gray-600">
            {mockPositions.filter((p) => p.status === PositionStatus.CLOSED).length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-xs text-muted-foreground">Gesamt P/L</p>
          <p className="text-2xl font-bold text-green-600">
            {mockPositions.reduce((sum, p) => sum + p.totalPnL, 0).toFixed(0)} €
          </p>
        </div>
      </div>

      {/* TanStack Position Table */}
      <PositionTableTanstack
        positions={mockPositions}
        onEdit={(pos) => console.log('Edit:', pos.symbol)}
        onAddTransaction={(id) => console.log('Add Transaction to:', id)}
      />

      {/* Features & Improvements */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-lg">✨ TanStack Table Features:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">⚡ Neue Features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ <strong>Sortierbare Spalten:</strong> Symbol, Preis, P/L (Click auf Header)</li>
              <li>✅ <strong>Kompakteres Design:</strong> Kleinere Paddings & Fonts</li>
              <li>✅ <strong>Performance:</strong> Optimiert für 1000+ Zeilen</li>
              <li>✅ <strong>TypeScript:</strong> Full Type Safety</li>
              <li>✅ <strong>Erweiterbar:</strong> Virtualisierung, Filter, Pagination</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">📦 Bundle Size:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• TanStack Table: ~15 KB (gzipped)</li>
              <li>• AG Grid Enterprise: 200+ KB</li>
              <li>• MUI Data Grid Pro: 150+ KB</li>
              <li>✅ <strong>Leichtgewichtig & Schnell!</strong></li>
            </ul>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <h4 className="font-semibold text-sm">🎯 Vergleich:</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded bg-muted/30">
              <p className="font-semibold mb-2">Custom Table</p>
              <p className="text-xs text-muted-foreground">+ Volle Kontrolle</p>
              <p className="text-xs text-muted-foreground">- Manuelle Sortierung</p>
              <p className="text-xs text-muted-foreground">- Kein Filtering</p>
            </div>
            <div className="p-3 border rounded bg-green-50 dark:bg-green-950/20">
              <p className="font-semibold mb-2 text-green-700 dark:text-green-400">
                TanStack Table ⭐
              </p>
              <p className="text-xs text-muted-foreground">+ Built-in Features</p>
              <p className="text-xs text-muted-foreground">+ Kompakt & Schnell</p>
              <p className="text-xs text-muted-foreground">+ Open Source</p>
            </div>
            <div className="p-3 border rounded bg-muted/30">
              <p className="font-semibold mb-2">AG Grid</p>
              <p className="text-xs text-muted-foreground">+ Sehr mächtig</p>
              <p className="text-xs text-muted-foreground">- Teuer ($5k+)</p>
              <p className="text-xs text-muted-foreground">- Overkill</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h4 className="font-semibold text-sm mb-2">🛠️ Verwendung:</h4>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`import { PositionTableTanstack } from '@/components/position-table-tanstack';

<PositionTableTanstack
  positions={positions}
  onEdit={(pos) => handleEdit(pos)}
  onAddTransaction={(id) => handleAddTransaction(id)}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
