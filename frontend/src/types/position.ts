import { TradeType, TradeSide, Broker } from './trade';

/**
 * Transaction Type - Entry or Exit
 */
export enum TransactionType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT'
}

/**
 * Position Status
 * OPEN - All shares still in position
 * PARTIAL - Some shares have been sold
 * CLOSED - All shares have been sold
 */
export enum PositionStatus {
  OPEN = 'OPEN',
  PARTIAL = 'PARTIAL',
  CLOSED = 'CLOSED'
}

/**
 * Single Transaction (Entry or Exit)
 */
export interface Transaction {
  id: string;
  positionId: string;
  
  type: TransactionType;
  date: string; // ISO 8601
  shares: number;
  price: number;
  value: number; // shares * price
  
  // For Exits only
  pnl?: number;
  pnlPercent?: number;
  
  // Position state after this transaction
  positionAvgPrice: number;
  positionTotalShares: number;
  
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Position (Master) - Can contain multiple transactions
 */
export interface Position {
  id: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  broker?: Broker;
  status: PositionStatus;
  
  // Aggregated values
  totalEntryShares: number;
  totalExitShares: number;
  remainingShares: number;
  
  avgEntryPrice: number;
  avgExitPrice?: number;
  
  totalEntryValue: number;
  totalExitValue?: number;
  
  // P/L calculations
  realizedPnL: number; // From closed exits
  unrealizedPnL: number; // From remaining shares
  totalPnL: number; // realized + unrealized
  totalPnLPercent: number;
  
  // Transactions
  transactions: Transaction[];
  
  // Timestamps
  firstEntryDate: string;
  lastExitDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to calculate position metrics
 */
export interface PositionMetrics {
  entryCount: number;
  exitCount: number;
  avgEntryPrice: number;
  avgExitPrice: number;
  remainingShares: number;
  closedPercent: number; // % of position that's been closed
  openPercent: number; // % of position still open
}

/**
 * DTO for creating a new transaction
 */
export interface CreateTransactionDto {
  positionId: string;
  type: TransactionType;
  date: string;
  shares: number;
  price: number;
  notes?: string;
}

/**
 * DTO for creating a new position
 */
export interface CreatePositionDto {
  symbol: string;
  type: TradeType;
  side: TradeSide;
  broker?: Broker;
  
  // First entry
  entryDate: string;
  entryShares: number;
  entryPrice: number;
  notes?: string;
}
