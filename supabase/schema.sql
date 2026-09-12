-- =============================================================================
-- TJournal - Supabase PostgreSQL Schema
-- =============================================================================
-- Führe dieses Skript im Supabase SQL Editor aus:
-- https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1. Tabelle 'trades' erstellen
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  symbol text not null,
  type text not null check (type in ('Aktie', 'Zertifikat', 'Optionsschein', 'Krypto')),
  side text not null default 'Long' check (side in ('Long', 'Short')),
  status text not null default 'open' check (status in ('open', 'closed')),
  shares numeric not null default 0,
  broker text,
  entry_date timestamptz not null default now(),
  entry_price numeric not null,
  entry_shares numeric,
  exit_date timestamptz,
  exit_price numeric,
  exit_shares numeric,
  fee numeric default 0,
  tax numeric default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Falls Tabelle bereits existiert: Spalten nachrüsten
alter table public.trades add column if not exists fee numeric default 0;
alter table public.trades add column if not exists tax numeric default 0;

-- 2. Performance-Indizes anlegen
create index if not exists idx_trades_user_id on public.trades(user_id);
create index if not exists idx_trades_status on public.trades(status);
create index if not exists idx_trades_symbol on public.trades(symbol);
create index if not exists idx_trades_entry_date on public.trades(entry_date desc);

-- 3. Automatischer Trigger für 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_trades_updated_at on public.trades;
create trigger set_trades_updated_at
before update on public.trades
for each row
execute function public.handle_updated_at();

-- 4. Row Level Security (RLS) aktivieren
alter table public.trades enable row level security;

-- Policy 1: Authentifizierte Nutzer haben vollen Zugriff auf ihre eigenen Trades
create policy "Users can manage their own trades"
  on public.trades
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy 2: Öffentlicher/Anon-Zugriff für Single-User ohne Authentifizierung
-- Falls die App als persönliches Trading-Journal ohne Login verwendet wird:
create policy "Public access to trades if no user_id set"
  on public.trades
  for all
  to anon
  using (user_id is null)
  with check (user_id is null);

-- =============================================================================
-- 5. Optionale Seed-Daten (Beispiel-Trades)
-- =============================================================================
insert into public.trades (
  symbol, type, side, status, shares, broker, entry_date, entry_price, entry_shares, exit_date, exit_price, exit_shares
) values 
  ('AAPL', 'Aktie', 'Long', 'open', 50, 'Trade Republic', '2024-01-15T09:30:00Z', 180.50, 50, null, null, 0),
  ('BTC', 'Krypto', 'Long', 'open', 2, 'Binance', '2024-01-08T14:15:00Z', 42000.00, 2, null, null, 0),
  ('MSFT', 'Aktie', 'Long', 'open', 75, 'Interactive Brokers', '2024-01-05T10:00:00Z', 370.00, 100, '2024-01-20T16:00:00Z', 385.00, 25),
  ('TSLA', 'Aktie', 'Long', 'closed', 0, 'Scalable Capital', '2023-12-01T15:30:00Z', 250.00, 20, '2024-01-10T21:00:00Z', 275.50, 20),
  ('NVDA', 'Aktie', 'Long', 'closed', 0, 'DEGIRO', '2023-11-15T11:00:00Z', 480.00, 30, '2023-12-28T17:45:00Z', 520.00, 30);
