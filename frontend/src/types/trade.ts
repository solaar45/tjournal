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

export enum Broker {
  TRADE_REPUBLIC = "Trade Republic",
  SCALABLE_CAPITAL = "Scalable Capital",
  INTERACTIVE_BROKERS = "Interactive Brokers",
  DEGIRO = "DEGIRO",
  COMDIRECT = "comdirect",
  ING = "ING",
  CONSORSBANK = "Consorsbank",
  SMARTBROKER = "Smartbroker",
  FLATEX = "flatex",
  ETORO = "eToro",
  BINANCE = "Binance",
  KRAKEN = "Kraken",
  COINBASE = "Coinbase",
  SONSTIGE = "Sonstige"
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  shares: number;
  side: TradeSide;
  broker?: Broker;
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
  broker?: Broker;
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
  broker?: Broker;
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
