import { Trade } from '@/types/trade';
import { calculatePnL } from '@/lib/tradeUtils';
import mockTradesData from '@/data/mockTrades.json';

/**
 * Shared In-Memory Store for trades
 * 
 * This ensures all API routes use the same data store.
 * In production, this would be replaced with a database.
 */
class TradesStore {
  private trades: Trade[];

  constructor() {
    this.trades = mockTradesData.map(calculatePnL);
  }

  getAll(): Trade[] {
    return [...this.trades];
  }

  getById(id: string): Trade | undefined {
    return this.trades.find(t => t.id === id);
  }

  add(trade: Trade): Trade {
    const tradeWithPnL = calculatePnL(trade);
    this.trades.push(tradeWithPnL);
    return tradeWithPnL;
  }

  update(id: string, updates: Partial<Trade>): Trade | null {
    const index = this.trades.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTrade: Trade = {
      ...this.trades[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.trades[index] = calculatePnL(updatedTrade);
    return this.trades[index];
  }

  delete(id: string): boolean {
    const index = this.trades.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.trades.splice(index, 1);
    return true;
  }

  filter(filters: { status?: string; type?: string }): Trade[] {
    let filtered = [...this.trades];

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Sort by entry date (newest first)
    filtered.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );

    return filtered;
  }
}

// Singleton instance - shared across all API routes
export const tradesStore = new TradesStore();
