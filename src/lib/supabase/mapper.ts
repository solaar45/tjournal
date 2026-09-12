import { Trade, TradeType, TradeSide, TradeStatus, Broker, CreateTradeDto, UpdateTradeDto } from '@/types/trade';
import { calculatePnL } from '@/lib/tradeUtils';

export interface TradeRow {
  id: string;
  user_id?: string | null;
  symbol: string;
  type: string;
  side: string;
  status: string;
  shares: number;
  broker?: string | null;
  entry_date: string;
  entry_price: number;
  entry_shares?: number | null;
  exit_date?: string | null;
  exit_price?: number | null;
  exit_shares?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row from Supabase to a Trade domain object with calculated P&L.
 */
export function mapRowToTrade(row: TradeRow): Trade {
  const trade: Trade = {
    id: row.id,
    symbol: row.symbol,
    type: row.type as TradeType,
    status: row.status as TradeStatus,
    shares: Number(row.shares),
    side: row.side as TradeSide,
    broker: (row.broker as Broker) || undefined,
    entryDate: row.entry_date,
    entryPrice: Number(row.entry_price),
    entryShares: row.entry_shares != null ? Number(row.entry_shares) : undefined,
    exitDate: row.exit_date || undefined,
    exitPrice: row.exit_price != null ? Number(row.exit_price) : undefined,
    exitShares: row.exit_shares != null ? Number(row.exit_shares) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return calculatePnL(trade);
}

/**
 * Maps a CreateTradeDto from the API request to a database row object.
 */
export function mapCreateDtoToRow(dto: CreateTradeDto) {
  return {
    symbol: dto.symbol,
    type: dto.type,
    side: dto.side,
    status: dto.status || 'open',
    shares: dto.shares,
    broker: dto.broker || null,
    entry_date: dto.entryDate,
    entry_price: dto.entryPrice,
    entry_shares: dto.entryShares != null ? dto.entryShares : dto.shares,
    exit_date: dto.exitDate || null,
    exit_price: dto.exitPrice != null ? dto.exitPrice : null,
    exit_shares: dto.exitShares != null ? dto.exitShares : null,
  };
}

/**
 * Maps an UpdateTradeDto to database update fields.
 */
export function mapUpdateDtoToRow(dto: UpdateTradeDto): Record<string, any> {
  const row: Record<string, any> = {};

  if (dto.symbol !== undefined) row.symbol = dto.symbol;
  if (dto.type !== undefined) row.type = dto.type;
  if (dto.side !== undefined) row.side = dto.side;
  if (dto.status !== undefined) row.status = dto.status;
  if (dto.shares !== undefined) row.shares = dto.shares;
  if (dto.broker !== undefined) row.broker = dto.broker;
  if (dto.entryDate !== undefined) row.entry_date = dto.entryDate;
  if (dto.entryPrice !== undefined) row.entry_price = dto.entryPrice;
  if (dto.entryShares !== undefined) row.entry_shares = dto.entryShares;
  if (dto.exitDate !== undefined) row.exit_date = dto.exitDate;
  if (dto.exitPrice !== undefined) row.exit_price = dto.exitPrice;
  if (dto.exitShares !== undefined) row.exit_shares = dto.exitShares;

  return row;
}
