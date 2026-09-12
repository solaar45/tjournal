# TJournal - Modernes Trading Journal

Ein schnelles, modernes und serverless-fähiges Trading Journal zur lückenlosen Protokollierung und Analyse deiner Trades (Aktien, Krypto, Zertifikate, Optionsscheine).

Optimiert für das Deployment auf **Vercel** mit **Supabase** (PostgreSQL) als Datenbank.

---

## 🚀 Features

- **Vollständiges Positions- & Transaktionsmanagement:** Unterstützung für Teilverkäufe (Entries & Exits) mit automatischer Realized/Unrealized P&L-Berechnung.
- **Performance-Dashboard:** Echtzeit-Kennzahlen (Gesamt P&L, Win Rate, offene/geschlossene Positionen, größter Gewinn/Verlust, Asset-Verteilung).
- **Schnelle Trade-Erfassung:** Umfangreiches Erfassungsdialogfeld sowie minimalistischer "Quick Entry"-Modus mit Tastatur-Shortcuts (`Cmd+N`, `Cmd+Q`).
- **TanStack Table:** Interaktive, sortierbare Positionstabelle mit Expand/Collapse für Teiltransaktionen.
- **Serverless & Cloud-Native:** Keine persistenten Server-Instanzen erforderlich. Vollständig lauffähig auf Vercel Serverless Functions und Supabase Database.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend-Bibliothek:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Data-Fetching & Cache:** [TanStack Query v5](https://tanstack.com/query/latest)
- **Datenbank & Backend:** [Supabase](https://supabase.com/) (PostgreSQL mit Row-Level Security)
- **Hosting / CI/CD:** [Vercel](https://vercel.com/)

---

## 📦 Setup & Installation

### 1. Supabase Datenbank einrichten

1. Erstelle ein kostenloses Projekt auf [supabase.com](https://supabase.com).
2. Öffne im Supabase-Dashboard den **SQL Editor** (`/dashboard/project/_/sql`).
3. Kopiere den Inhalt der Datei [`supabase/schema.sql`](supabase/schema.sql) in den Editor und führe das Skript aus.
   - Dies legt die Tabelle `trades`, Indizes, Trigger und Row-Level-Security (RLS) Policies an.
   - Es fügt auch 5 Beispieldaten ein (AAPL, BTC, MSFT, TSLA, NVDA).
4. Navigiere zu **Project Settings -> API** und kopiere:
   - **Project URL**
   - **anon / public key**

### 2. Lokale Entwicklung

1. Repository klonen und Abhängigkeiten installieren:
   ```bash
   git clone https://github.com/solaar45/tjournal.git
   cd tjournal
   npm install
   ```

2. `.env.local` erstellen und mit deinen Supabase-Keys befüllen:
   ```bash
   cp .env.example .env.local
   ```
   Trage deine Werte ein:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
   ```

3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
   Die App ist nun erreichbar unter [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment auf Vercel

1. Push deine Änderungen in dein GitHub-Repository (`main`-Branch).
2. Öffne [vercel.com](https://vercel.com) und importiere das Repository.
3. Vercel erkennt Next.js automatisch im Root-Verzeichnis.
4. Füge unter **Environment Variables** folgende Variablen hinzu:
   - `NEXT_PUBLIC_SUPABASE_URL` = Dein Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Dein Supabase Anon Key
5. Klicke auf **Deploy**. Nach ca. 1 Minute ist deine App live!

---

## 📡 API Endpunkte

Alle API-Routen befinden sich unter `/api/trades` und kommunizieren direkt mit Supabase:

| Methode | Endpunkt | Beschreibung |
| :--- | :--- | :--- |
| `GET` | `/api/trades` | Alle Trades laden (Filter: `?status=open&type=Aktie`) |
| `POST` | `/api/trades` | Neuen Trade anlegen |
| `GET` | `/api/trades/:id` | Einzelnen Trade laden |
| `PATCH`| `/api/trades/:id` | Trade aktualisieren (z. B. Teilausstieg, Status) |
| `DELETE`| `/api/trades/:id`| Trade löschen |
| `GET` | `/api/trades/stats` | Performance-Kennzahlen berechnen |

---

## 📄 Lizenz

MIT
