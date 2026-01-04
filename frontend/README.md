# Trading Journal - Frontend

React-basiertes Frontend für das Trading Journal, integriert mit Phoenix/Elixir Backend.

## Features

- ✅ **CRUD-Operationen** für Trades (Erstellen, Lesen, Bearbeiten, Löschen)
- ✅ **Echtzeit-Statistiken** Dashboard mit P&L, Win-Rate, etc.
- ✅ **Responsive Design** für Desktop und Mobile
- ✅ **Dark Mode** UI
- ✅ **Formular-Validierung**
- ✅ **Error Handling** mit benutzerfreundlichen Meldungen

## Tech Stack

- **React 18.3.1**
- **Axios** für HTTP-Requests
- **Papa Parse** für CSV-Parsing (bereit für Import/Export)
- **Create React App**

## Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env`:

```bash
cp .env.example .env
```

Passe die API-URL bei Bedarf an:

```env
REACT_APP_API_URL=http://localhost:4000/api
```

### 3. Backend starten

Stelle sicher, dass das Phoenix-Backend läuft:

```bash
cd ../backend_phoenix
mix phx.server
```

Backend sollte auf `http://localhost:4000` laufen.

### 4. Frontend starten

```bash
npm start
```

Frontend öffnet sich auf `http://localhost:3000`.

## Verwendung

### Neuen Trade erstellen

1. Klicke auf **"+ Neuer Trade"** Button
2. Fülle das Formular aus (Pflichtfelder: Symbol, Typ, Seite, Anzahl, Einstiegsdatum, Einstiegspreis)
3. Klicke auf **"Erstellen"**

### Trade bearbeiten

1. Klicke auf das Stift-Symbol (✏️) in der Trade-Zeile
2. Bearbeite die Felder
3. Klicke auf **"Speichern"**

### Trade löschen

1. Klicke auf das Mülleimer-Symbol (🗑️) in der Trade-Zeile
2. Bestätige die Löschung

### Trade schließen

1. Bearbeite den Trade
2. Setze Status auf **"Geschlossen"**
3. Füge **Ausstiegsdatum** und **Ausstiegspreis** hinzu
4. P&L wird automatisch berechnet

## Projekt-Struktur

```
frontend/
├── public/              # Statische Dateien
├── src/
│   ├── api/            # API Service Layer
│   │   └── tradesApi.js  # Phoenix Backend API Calls
│   ├── components/     # React Komponenten
│   │   ├── TradeForm.js    # Formular für Trade Create/Edit
│   │   ├── TradeForm.css
│   │   ├── TradeList.js    # Tabelle mit allen Trades
│   │   └── TradeList.css
│   ├── App.js          # Haupt-Komponente mit State-Management
│   ├── App.css         # Haupt-Styles
│   ├── index.js        # Entry Point
│   └── index.css       # Global Styles
├── .env.example        # Beispiel-Konfiguration
├── package.json
└── README.md
```

## API Integration

Das Frontend kommuniziert mit dem Phoenix-Backend über folgende Endpoints:

- `GET /api/trades` - Alle Trades abrufen
- `GET /api/trades/:id` - Einzelnen Trade abrufen
- `POST /api/trades` - Neuen Trade erstellen
- `PUT /api/trades/:id` - Trade aktualisieren
- `DELETE /api/trades/:id` - Trade löschen
- `GET /api/trades/statistics` - Statistiken abrufen

### Beispiel API Request:

```javascript
import tradesApi from './api/tradesApi';

// Trade erstellen
const newTrade = {
  symbol: 'AAPL',
  type: 'Aktie',
  side: 'Long',
  status: 'open',
  shares: 100,
  entrydate: '2024-01-15',
  entryprice: 150.50,
  notes: 'Langfristiges Investment'
};

const createdTrade = await tradesApi.createTrade(newTrade);
```

## Verfügbare Scripts

```bash
# Development Server starten
npm start

# Production Build erstellen
npm run build

# Tests ausführen
npm test

# Linting
npm run lint
```

## Troubleshooting

### "Fehler beim Laden der Trades"

- Überprüfe, ob das Phoenix-Backend läuft (`mix phx.server`)
- Stelle sicher, dass die API-URL in `.env` korrekt ist
- Überprüfe CORS-Einstellungen im Backend

### "Network Error" / CORS-Fehler

- Das Phoenix-Backend muss CORS für `http://localhost:3000` erlauben
- Check `backend_phoenix/config/config.exs` für CORS-Konfiguration

### Styling-Probleme

- Stelle sicher, dass alle CSS-Dateien korrekt importiert sind
- Browser-Cache leeren mit `Ctrl+Shift+R` (oder `Cmd+Shift+R` auf Mac)

## Nächste Schritte

- [ ] CSV Import/Export implementieren
- [ ] Advanced Filtering (nach Datum, Symbol, Status)
- [ ] Sortierung in Tabelle
- [ ] Pagination für große Datensätze
- [ ] Charts/Visualisierungen (Recharts)
- [ ] TypeScript Migration
- [ ] Unit Tests

## Contributing

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue erstellen.

## License

MIT
