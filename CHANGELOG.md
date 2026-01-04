# Changelog

Alle bedeutenden Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [Unreleased]

### Phase 1: Frontend-Integration (2026-01-04) ✅

#### Hinzugefügt

- **API Service Layer** (`frontend/src/api/tradesApi.js`)
  - Axios-basierter Service für alle Phoenix-Backend API-Calls
  - Unterstützung für CRUD-Operationen
  - Statistik-Endpoint Integration
  - Konfigurierbare API-URL über Umgebungsvariablen

- **TradeForm Komponente** (`frontend/src/components/TradeForm.js`)
  - Modal-basiertes Formular für Trade-Erstellung und -Bearbeitung
  - Validierung aller Pflichtfelder
  - Unterstützung für alle Trade-Typen (Aktie, Zertifikat, Optionsschein, Krypto)
  - Long/Short Position Auswahl
  - Status-Management (offen, geschlossen, ausstehend)
  - Notizen-Feld für zusätzliche Informationen

- **TradeList Komponente** (`frontend/src/components/TradeList.js`)
  - Tabellarische Darstellung aller Trades
  - Automatische P&L-Berechnung
  - Farbcodierte Status-Badges
  - Long/Short Badges
  - Edit und Delete Aktionen
  - Responsive Design

- **Dashboard mit Statistiken**
  - Gesamt-Trades Zähler
  - Gewinn/Verlust Trade Zähler
  - Gesamt P&L Anzeige
  - Durchschnittlicher P&L pro Trade
  - Win-Rate Prozentsatz
  - Echtzeit-Updates nach jeder Änderung

- **Error Handling & Loading States**
  - Benutzerfreundliche Fehlermeldungen
  - Loading-Spinner während Daten geladen werden
  - Retry-Funktionalität bei Fehlern

- **Konfigurationsdateien**
  - `.env.example` für API-Konfiguration
  - Aktualisierte `.gitignore` für `.env` Dateien
  - Frontend-spezifisches README mit Setup-Anleitung

#### Geändert

- **App.js** - Komplettes Rewrite mit:
  - State-Management für Trades und Statistiken
  - CRUD-Operationen Integration
  - Modal-State für TradeForm
  - Error und Loading State Handling

- **App.css** - Modernisiertes Styling mit:
  - Dashboard-Layout
  - Statistics Cards Grid
  - Responsive Design
  - Dark Mode Theme
  - Verbessertes Button-Design

#### Migration von Legacy Backend

- ❌ Alter Endpoint `/api/daten` entfernt
- ✅ Neue Phoenix API Endpoints integriert:
  - `GET /api/trades` - Alle Trades
  - `GET /api/trades/:id` - Einzelner Trade
  - `POST /api/trades` - Trade erstellen
  - `PUT /api/trades/:id` - Trade aktualisieren
  - `DELETE /api/trades/:id` - Trade löschen
  - `GET /api/trades/statistics` - Statistiken

- ✅ Trade-Datenstruktur aktualisiert:
  - Alte Felder: `feld1`, `feld2`, etc.
  - Neue Felder: `symbol`, `type`, `side`, `status`, `shares`, `entrydate`, `entryprice`, `exitdate`, `exitprice`, `notes`, `inserted_at`, `updated_at`

#### Technische Details

- React 18.3.1
- Axios für HTTP-Requests
- Component-basierte Architektur
- CSS Modules für Styling
- Environment-basierte Konfiguration

### Nächste Schritte (Phase 2)

- [ ] CSV Import/Export Funktionalität
- [ ] Legacy Backend Ordner entfernen (`backend/`, `backend-2/`)
- [ ] Advanced Filtering und Sorting
- [ ] Pagination implementieren
- [ ] Charts/Visualisierungen

---

## Backend Migration

### Phoenix Backend (2025-12-XX) ✅

#### Hinzugefügt

- Elixir/Phoenix 1.7 Backend
- PostgreSQL Datenbank
- RESTful JSON API
- Trade CRUD Operations
- Statistics Endpoint
- Docker Setup
- Tests
- CI/CD Pipeline (GitHub Actions)
- Credo Linting

#### Deprecated

- Flask Backend (`backend/`) - wird entfernt
- Strapi Backend (`backend-2/`) - wird entfernt

---

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).
