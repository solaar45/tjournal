export enum TradeType {
  AKTIE = "Aktie",
  ZERTIFIKAT = "Zertifikat",
  OPTIONSSCHEIN = "Optionsschein",
  KRYPTO = "Krypto"
}

export enum TradeSide {
  LONG = "Long",
  SHORT = "Short"
}

export enum TradeStatus {
  OPEN = "open",
  CLOSED = "closed"
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  shares: number;
  side: TradeSide;
  entryDate: string; // ISO 8601 date string
  entryPrice: number;
  entryShares?: number; // Anzahl beim Einstieg
  exitDate?: string;
  exitPrice?: number;
  exitShares?: number; // Anzahl beim Ausstieg (Teilverkauf)
  pnl?: number; // calculated field
  pnlPercent?: number; // calculated field
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTradeDto {
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  shares: number;
  side: TradeSide;
  entryDate: string;
  entryPrice: number;
  entryShares?: number;
  exitDate?: string;
  exitPrice?: number;
  exitShares?: number;
}

export interface UpdateTradeDto {
  symbol?: string;
  type?: TradeType;
  status?: TradeStatus;
  shares?: number;
  side?: TradeSide;
  entryDate?: string;
  entryPrice?: number;
  entryShares?: number;
  exitDate?: string;
  exitPrice?: number;
  exitShares?: number;
}

export interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}
