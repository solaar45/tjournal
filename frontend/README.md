# Trading Journal Frontend

Modernes Trading Journal Frontend mit Next.js 15, TypeScript und TanStack Query.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query v5
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: shadcn/ui Charts (Recharts)
- **Notifications**: Sonner

## Setup

### 1. Dependencies installieren

```bash
cd frontend
npm install
```

### 2. Fehlende shadcn/ui Components hinzufügen

```bash
# Badge Component (wird im Dashboard verwendet)
npx shadcn@latest add badge

# Optional: Weitere Components für zukünftige Features
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add tabs
npx shadcn@latest add separator
```

### 3. Development Server starten

```bash
npm run dev
```

Die App ist dann verfügbar unter: [http://localhost:3000](http://localhost:3000)

## Projekt-Struktur

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Mock API Routes
│   │   │   └── trades/       # CRUD Endpoints
│   │   ├── layout.tsx        # Root Layout mit Providers
│   │   ├── page.tsx          # Dashboard Page
│   │   ├── providers.tsx     # Query Client Provider
│   │   └── globals.css       # Tailwind Styles
│   ├── components/
│   │   └── ui/               # shadcn/ui Components
│   ├── hooks/
│   │   └── useTrades.ts      # TanStack Query Hooks
│   ├── lib/
│   │   ├── queryClient.ts    # Query Client Config
│   │   ├── tradeUtils.ts     # P&L Berechnungen
│   │   └── utils.ts          # shadcn/ui utils
│   ├── types/
│   │   └── trade.ts          # TypeScript Types
│   └── data/
│       └── mockTrades.json   # Mock Daten (7 Beispiel-Trades)
└── package.json
```

## Features

### Aktuell implementiert

✅ **Dashboard**
- KPI Cards (Gesamt P&L, Win Rate, Offene/Geschlossene Trades)
- Performance Metriken (Best/Worst, Durchschnitte)
- Trade-Verteilung nach Typ
- Letzte 5 Trades in Tabelle
- Loading & Error States

✅ **Mock API**
- GET /api/trades - Alle Trades (mit Filter-Support)
- GET /api/trades/:id - Einzelner Trade
- POST /api/trades - Trade erstellen
- PATCH /api/trades/:id - Trade aktualisieren
- DELETE /api/trades/:id - Trade löschen
- GET /api/trades/stats - Dashboard-Statistiken

✅ **Data Management**
- TanStack Query für Server State
- Optimistic Updates
- Automatisches Caching (5 Min)
- Toast-Notifications bei Aktionen
- React Query DevTools (Development)

### Nächste Schritte

⏳ Trade-Formular mit React Hook Form + Zod
⏳ Trade-Detail-Seite mit Edit-Funktion
⏳ Charts mit shadcn/ui Charts (P&L-Verlauf)
⏳ Filter & Sortierung in Trade-Liste
⏳ CSV-Import mit PapaParse
⏳ Analytics-Seite mit erweiterten Metriken

## API Hooks

### Daten abrufen

```typescript
import { useTrades, useTrade, useTradeStats } from '@/hooks/useTrades';

// Alle Trades
const { data: trades } = useTrades();

// Gefilterte Trades
const { data: openTrades } = useTrades({ status: 'open' });

// Einzelner Trade
const { data: trade } = useTrade('trade-id');

// Statistiken
const { data: stats } = useTradeStats();
```

### Daten mutieren

```typescript
import { 
  useCreateTrade, 
  useUpdateTrade, 
  useDeleteTrade,
  useCloseTrade 
} from '@/hooks/useTrades';

// Trade erstellen
const createTrade = useCreateTrade();
createConnect.mutate({
  symbol: 'AAPL',
  type: TradeType.AKTIE,
  // ...
});

// Trade aktualisieren
const updateTrade = useUpdateTrade();
updateTrade.mutate({ id: '1', exitPrice: 200 });

// Trade löschen
const deleteTrade = useDeleteTrade();
deleteTrade.mutate('trade-id');

// Trade schließen (Convenience)
const closeTrade = useCloseTrade();
closeTrade.mutate('trade-id', 185.50);
```

## Mock Daten

Das Projekt enthält 7 Beispiel-Trades:
- 3x Aktien (AAPL, NVDA, MSFT, TSLA, AMZN)
- 2x Krypto (BTC, ETH)
- 2x Offen, 5x Geschlossen
- Mix aus Long/Short
- Gesamt P&L: +2.224,50 €

## Entwicklung

### Commands

```bash
# Development Server
npm run dev

# Production Build
npm run build

# Production Server
npm start

# Type Check
npm run type-check

# Linting
npm run lint
```

### React Query DevTools

Die DevTools sind automatisch im Development-Modus verfügbar:
- Icon unten rechts anklicken
- Query-Status inspizieren
- Cache manuell invalidieren
- Network-Requests verfolgen

## Backend-Migration

Später können Sie einfach die API-Base-URL ändern:

```typescript
// src/hooks/useTrades.ts

// Aktuell:
const API_BASE = '/api';

// Später:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
```

Alle Hooks und Komponenten funktionieren ohne Änderungen!

## TypeScript Types

Alle Trading-relevanten Types sind in `src/types/trade.ts` definiert:

```typescript
export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  shares: number;
  side: TradeSide;
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  pnl?: number;          // Berechnet
  pnlPercent?: number;   // Berechnet
}
```

## Troubleshooting

### Badge Component fehlt

Falls beim Start ein Fehler zu `@/components/ui/badge` kommt:

```bash
npx shadcn@latest add badge
```

### React Query DevTools nicht sichtbar

DevTools sind nur im Development-Modus aktiv:
- Starten Sie mit `npm run dev`
- Schauen Sie unten rechts nach dem Icon

### Port 3000 bereits belegt

```bash
# Anderen Port verwenden
PORT=3001 npm run dev
```

## Lizenz

MIT
