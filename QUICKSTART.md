# 🚀 Quick Start Guide - Trading Journal

Schnellstart-Anleitung um das Trading Journal mit Phoenix Backend und React Frontend zum Laufen zu bringen.

## Voraussetzungen

- **Elixir 1.14+** und **Erlang/OTP 25+**
- **PostgreSQL 14+**
- **Node.js 18+** und **npm**
- **Git**

## Installation in 5 Minuten

### 1. Repository klonen

```bash
git clone https://github.com/solaar45/tjournal.git
cd tjournal
git checkout feature/phoenix-backend
```

### 2. Backend Setup

```bash
cd backend_phoenix

# Dependencies installieren
mix deps.get

# Datenbank erstellen und Migrationen ausführen
mix ecto.setup

# Backend starten
mix phx.server
```

✅ Backend läuft jetzt auf: **http://localhost:4000**

📊 LiveDashboard: **http://localhost:4000/dashboard**

### 3. Frontend Setup (neues Terminal)

```bash
cd frontend

# Dependencies installieren
npm install

# Environment-Datei erstellen
cp .env.example .env

# Frontend starten
npm start
```

✅ Frontend öffnet sich automatisch auf: **http://localhost:3000**

## Verwendung

### Ersten Trade erstellen

1. Klicke auf **"+ Neuer Trade"**
2. Fülle das Formular aus:
   - **Symbol**: z.B. "AAPL"
   - **Typ**: "Aktie"
   - **Seite**: "Long"
   - **Anzahl**: 100
   - **Einstiegsdatum**: Wähle ein Datum
   - **Einstiegspreis**: z.B. 150.50
3. Klicke **"Erstellen"**

### Trade schließen

1. Klicke auf das **Stift-Symbol** (✏️) neben dem Trade
2. Ändere Status auf **"Geschlossen"**
3. Füge **Ausstiegsdatum** und **Ausstiegspreis** hinzu
4. Klicke **"Speichern"**
5. P&L wird automatisch berechnet und im Dashboard angezeigt!

## Docker Alternative

Falls du Docker bevorzugst:

```bash
cd backend_phoenix
docker-compose up -d
```

Das startet PostgreSQL und Phoenix Backend in Containern.

## Troubleshooting

### Backend startet nicht

```bash
# PostgreSQL Service prüfen
sudo systemctl status postgresql

# Falls nicht installiert:
# Ubuntu/Debian:
sudo apt install postgresql

# macOS:
brew install postgresql
brew services start postgresql
```

### "Connection refused" Fehler im Frontend

- Stelle sicher, dass Backend auf Port 4000 läuft
- Prüfe `.env` Datei im Frontend:
  ```
  REACT_APP_API_URL=http://localhost:4000/api
  ```

### CORS-Fehler

- Backend muss CORS erlauben - ist bereits in `config/config.exs` konfiguriert
- Browser-Cache leeren: `Ctrl+Shift+R` (Windows) oder `Cmd+Shift+R` (Mac)

### Datenbank-Fehler

```bash
cd backend_phoenix

# Datenbank zurücksetzen und neu erstellen
mix ecto.reset
```

## Beispiel-Daten laden

```bash
cd backend_phoenix
mix run priv/repo/seeds.exs
```

Dies fügt einige Beispiel-Trades hinzu.

## API Testen

Mit curl oder einem API-Tool wie Postman:

```bash
# Alle Trades abrufen
curl http://localhost:4000/api/trades

# Statistiken abrufen
curl http://localhost:4000/api/trades/statistics

# Neuen Trade erstellen
curl -X POST http://localhost:4000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "trade": {
      "symbol": "TSLA",
      "type": "Aktie",
      "side": "Long",
      "status": "open",
      "shares": 50,
      "entrydate": "2024-01-20",
      "entryprice": 180.50,
      "notes": "Test Trade"
    }
  }'
```

## Nächste Schritte

- 📊 Erkunde das **LiveDashboard** für Performance-Metriken
- 📊 Füge mehr Trades hinzu und beobachte deine Statistiken
- 📊 Experimentiere mit verschiedenen Asset-Typen
- 📊 Schließe Trades und verfolge dein P&L

## Entwicklung

### Tests ausführen

```bash
# Backend Tests
cd backend_phoenix
mix test

# Frontend Tests
cd frontend
npm test
```

### Code-Qualität prüfen

```bash
# Backend
cd backend_phoenix
mix format        # Code formatieren
mix credo         # Linting

# Frontend
cd frontend
npm run lint      # Linting
```

## Weitere Dokumentation

- [Backend README](backend_phoenix/README.md) - Detaillierte Backend-Doku
- [Frontend README](frontend/README.md) - Detaillierte Frontend-Doku
- [Projekt README](README.md) - Gesamtübersicht
- [CHANGELOG](CHANGELOG.md) - Änderungshistorie

## Support

Bei Problemen:

1. Überprüfe die Logs:
   - Backend: Terminal wo `mix phx.server` läuft
   - Frontend: Browser Developer Console (F12)
2. Suche in GitHub Issues
3. Erstelle ein neues Issue mit detaillierter Fehlerbeschreibung

## Lizenz

MIT

---

**Happy Trading! 📈🚀**
