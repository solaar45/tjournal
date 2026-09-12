import { TradeType, TradeSide, TradeStatus, Broker, CreateTradeDto } from '@/types/trade';

export interface RawCsvRow {
  date: string;
  time?: string;
  status?: string;
  reference?: string;
  description: string;
  assetType?: string;
  type: string; // 'Buy' | 'Sell'
  isin: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  tax: number;
  currency?: string;
}

export interface ImportCandidate extends CreateTradeDto {
  isin: string;
  originalDescription: string;
  pnl?: number;
  netPnl?: number;
  pnlPercent?: number;
  selected?: boolean;
}

/**
 * Bekannte Basiswerte (Underlyings) zu Ticker-Symbolen Mapping
 */
const UNDERLYING_TICKER_MAP: Record<string, string> = {
  // US Tech & Bluechips
  'dell': 'DELL',
  'dell technologies': 'DELL',
  'apple': 'AAPL',
  'apple inc': 'AAPL',
  'microsoft': 'MSFT',
  'microsoft corp': 'MSFT',
  'nvidia': 'NVDA',
  'nvidia corp': 'NVDA',
  'tesla': 'TSLA',
  'tesla inc': 'TSLA',
  'amazon': 'AMZN',
  'amazon.com': 'AMZN',
  'alphabet': 'GOOGL',
  'google': 'GOOGL',
  'meta': 'META',
  'meta platforms': 'META',
  'amd': 'AMD',
  'advanced micro devices': 'AMD',
  'intel': 'INTC',
  'broadcom': 'AVGO',
  'qualcomm': 'QCOM',
  'palantir': 'PLTR',
  'coinbase': 'COIN',
  'microstrategy': 'MSTR',
  'netflix': 'NFLX',
  'salesforce': 'CRM',
  'adobe': 'ADBE',
  'uber': 'UBER',
  'airbnb': 'ABNB',
  'disney': 'DIS',
  'boeing': 'BA',
  'visa': 'V',
  'mastercard': 'MA',
  'jpmorgan': 'JPM',
  'goldman sachs': 'GS',

  // Indizes
  'dax': 'DAX',
  'dax 40': 'DAX',
  's&p 500': 'SPX',
  's&p': 'SPX',
  'spx': 'SPX',
  'nasdaq': 'NDX',
  'nasdaq 100': 'NDX',
  'ndx': 'NDX',
  'dow jones': 'DJI',
  'euro stoxx 50': 'SX5E',

  // Deutschland / Europa
  'sap': 'SAP',
  'siemens': 'SIE',
  'allianz': 'ALV',
  'rheinmetall': 'RHM',
  'mercedes': 'MBG',
  'mercedes-benz': 'MBG',
  'bmw': 'BMW',
  'volkswagen': 'VOW3',
  'vw': 'VOW3',
  'porsche': 'PAH3',
  'deutsche bank': 'DBK',
  'deutsche telekom': 'DTE',
  'basf': 'BAS',
  'bayer': 'BAYN',
  'infineon': 'IFX',
  'asml': 'ASML',
  'novo nordisk': 'NOVO',
  'airbus': 'AIR',

  // Rohstoffe & Krypto
  'bitcoin': 'BTC',
  'btc': 'BTC',
  'ethereum': 'ETH',
  'eth': 'ETH',
  'gold': 'GOLD',
  'silber': 'SILVER',
  'silver': 'SILVER',
  'brent': 'OIL',
  'crude oil': 'OIL',
  'öl': 'OIL',
};

/**
 * Parst eine Zahl im deutschen oder englischen Format (z.B. "1.030" -> 1030, "4,09" -> 4.09, "-4.078,80" -> -4078.80)
 */
export function parseLocalizedNumber(value: any): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value || typeof value !== 'string') return 0;

  let cleaned = value.trim();
  if (cleaned === '' || cleaned === '-') return 0;

  // Wenn sowohl Punkt als auch Komma vorkommen:
  // "4.212,70" -> Tausenderpunkt entfernen, Komma zu Punkt
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Nur Komma: "4,09" -> "4.09"
    cleaned = cleaned.replace(',', '.');
  } else if (cleaned.includes('.')) {
    // Nur Punkt: Könnte Tausender ("1.030") oder Dezimal ("1.03") sein.
    // Bei 3 Ziffern nach dem Punkt ("1.030") handelt es sich im dt. Broker-Export um Tausender!
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3 && Number(parts[0]) >= 1) {
      cleaned = cleaned.replace('.', '');
    }
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Ermittelt Underlying, Ticker-Symbol, Asset-Typ und Richtung (Side) aus Beschreibung / ISIN
 */
export function analyzeSecurity(description: string, isin: string): {
  symbol: string;
  type: TradeType;
  side: TradeSide;
  underlyingName: string;
} {
  const desc = (description || '').trim();
  const descLower = desc.toLowerCase();

  // 1. Asset-Typ erkennen
  let type: TradeType = TradeType.AKTIE;
  if (
    descLower.includes('turbo') ||
    descLower.includes('knock-out') ||
    descLower.includes('open end') ||
    descLower.includes('mini future') ||
    descLower.includes('faktor') ||
    descLower.includes('zertifikat')
  ) {
    type = TradeType.ZERTIFIKAT;
  } else if (
    descLower.includes('optionsschein') ||
    descLower.includes('warrant')
  ) {
    type = TradeType.OPTIONSSCHEIN;
  } else if (
    descLower.includes('bitcoin') ||
    descLower.includes('ethereum') ||
    descLower.includes('crypto') ||
    descLower.includes('krypto')
  ) {
    type = TradeType.KRYPTO;
  }

  // 2. Richtung (Side) erkennen
  let side: TradeSide = TradeSide.LONG;
  if (
    /\b(p\s+short|short|put|bear)\b/i.test(desc)
  ) {
    side = TradeSide.SHORT;
  } else if (
    /\b(c\s+long|long|call|bull)\b/i.test(desc)
  ) {
    side = TradeSide.LONG;
  }

  // 3. Underlying Name extrahieren (falls Derivat)
  let underlyingName = desc;
  if (type === TradeType.ZERTIFIKAT || type === TradeType.OPTIONSSCHEIN) {
    // Schneide alles vor "C Long", "P Short", "Long", "Short", "Call", "Put", "Turbo" etc. ab
    const match = desc.match(/^(.*?)(?:\s+(?:c\s+long|p\s+short|call|put|long|short|turbo|open\s+end|mini\s+future|optionsschein|faktor|zertifikat)\b)/i);
    if (match && match[1]) {
      underlyingName = match[1].trim();
    }
  }

  // 4. Ticker-Symbol ermitteln
  const cleanUnderlyingLower = underlyingName.toLowerCase().replace(/[^a-z0-9\s&]/g, '').trim();
  let symbol = UNDERLYING_TICKER_MAP[cleanUnderlyingLower];

  if (!symbol) {
    // Prüfe Teilstrings im Wörterbuch
    for (const [nameKey, ticker] of Object.entries(UNDERLYING_TICKER_MAP)) {
      if (cleanUnderlyingLower.startsWith(nameKey) || cleanUnderlyingLower.includes(nameKey)) {
        symbol = ticker;
        break;
      }
    }
  }

  if (!symbol) {
    // Fallback: Ticker aus dem ersten Wort / Kürzel bilden
    const words = underlyingName.split(/\s+/);
    if (words.length > 0 && words[0].length >= 2 && words[0].length <= 6) {
      symbol = words[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else {
      symbol = underlyingName.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
  }

  return {
    symbol: symbol || 'UNKNOWN',
    type,
    side,
    underlyingName,
  };
}

/**
 * Erkennt den Broker anhand von Referenznummer oder Dateiinhalten
 */
export function detectBroker(reference?: string): Broker {
  if (!reference) return Broker.SONSTIGE;
  const ref = reference.toUpperCase();
  if (ref.startsWith('SCAL')) return Broker.SCALABLE_CAPITAL;
  if (ref.startsWith('TR') || ref.includes('REPUBLIC')) return Broker.TRADE_REPUBLIC;
  if (ref.startsWith('IB') || ref.includes('INTERACTIVE')) return Broker.INTERACTIVE_BROKERS;
  return Broker.SONSTIGE;
}

/**
 * Parst den CSV-Text in standardisierte Transaktionszeilen
 */
export function parseBrokerCsv(csvText: string): RawCsvRow[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Header analysieren
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // Helper zum Splitten unter Beachtung von Anführungszeichen
  const splitCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
  };

  const headers = splitCsvLine(headerLine).map(h => h.toLowerCase().trim());
  const rows: RawCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawValues = splitCsvLine(lines[i]);
    if (rawValues.length < 5) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = rawValues[index] || '';
    });

    const isin = rowObj['isin'] || '';
    const description = rowObj['description'] || rowObj['name'] || rowObj['wertpapier'] || '';
    const type = rowObj['type'] || rowObj['typ'] || rowObj['transaktionstyp'] || '';
    const date = rowObj['date'] || rowObj['datum'] || '';
    const time = rowObj['time'] || rowObj['zeit'] || '';

    if (!description && !isin) continue;

    rows.push({
      date,
      time,
      status: rowObj['status'] || 'Executed',
      reference: rowObj['reference'] || rowObj['order-id'] || '',
      description,
      assetType: rowObj['assettype'] || '',
      type: type.toLowerCase().includes('buy') || type.toLowerCase().includes('kauf') ? 'Buy' : 'Sell',
      isin,
      shares: Math.abs(parseLocalizedNumber(rowObj['shares'] || rowObj['stueck'] || rowObj['anzahl'])),
      price: parseLocalizedNumber(rowObj['price'] || rowObj['kurs'] || rowObj['preis']),
      amount: parseLocalizedNumber(rowObj['amount'] || rowObj['betrag'] || rowObj['ausmachender_betrag']),
      fee: Math.abs(parseLocalizedNumber(rowObj['fee'] || rowObj['gebuehr'] || rowObj['kosten'])),
      tax: Math.abs(parseLocalizedNumber(rowObj['tax'] || rowObj['steuer'] || rowObj['abgeltungsteuer'])),
      currency: rowObj['currency'] || 'EUR',
    });
  }

  return rows;
}

/**
 * Gruppiert und matcht Transaktionen nach ISIN und bildet vollständige Trades
 */
export function processCsvToTrades(rows: RawCsvRow[]): ImportCandidate[] {
  // Nur ausgeführte Orders berücksichtigen
  const executed = rows.filter(r => !r.status || r.status.toLowerCase() === 'executed' || r.status.toLowerCase() === 'ausgeführt');

  // Chronologisch sortieren (älteste zuerst)
  executed.sort((a, b) => {
    const timeA = `${a.date}T${a.time || '00:00:00'}`;
    const timeB = `${b.date}T${b.time || '00:00:00'}`;
    return new Date(timeA).getTime() - new Date(timeB).getTime();
  });

  // Nach ISIN gruppieren
  const isinGroups: Record<string, RawCsvRow[]> = {};
  executed.forEach(row => {
    const key = row.isin || row.description;
    if (!isinGroups[key]) isinGroups[key] = [];
    isinGroups[key].push(row);
  });

  const candidates: ImportCandidate[] = [];

  for (const [key, items] of Object.entries(isinGroups)) {
    const buys = items.filter(i => i.type === 'Buy');
    const sells = items.filter(i => i.type === 'Sell');

    const firstItem = items[0];
    const { symbol, type, side, underlyingName } = analyzeSecurity(firstItem.description, firstItem.isin);
    const broker = detectBroker(firstItem.reference);

    // Fall 1: Genau 1 Kauf und 1 Verkauf (wie im Beispiel: Round-Trip Trade)
    if (buys.length === 1 && sells.length === 1) {
      const buy = buys[0];
      const sell = sells[0];

      const entryDate = buy.time ? `${buy.date}T${buy.time}Z` : `${buy.date}T00:00:00Z`;
      const exitDate = sell.time ? `${sell.date}T${sell.time}Z` : `${sell.date}T00:00:00Z`;

      const shares = buy.shares;
      const entryPrice = buy.price;
      const exitPrice = sell.price;
      const totalFee = Number((buy.fee + sell.fee).toFixed(2));
      const totalTax = Number((buy.tax + sell.tax).toFixed(2));

      const multiplier = side === TradeSide.LONG ? 1 : -1;
      const grossPnl = Number(((exitPrice - entryPrice) * shares * multiplier).toFixed(2));
      const netPnl = Number((grossPnl - totalFee - totalTax).toFixed(2));
      const pnlPercent = Number((((exitPrice - entryPrice) / entryPrice) * 100 * multiplier).toFixed(2));

      candidates.push({
        isin: firstItem.isin,
        originalDescription: firstItem.description,
        symbol,
        type,
        side,
        broker,
        status: TradeStatus.CLOSED,
        shares: 0,
        entryShares: shares,
        entryPrice,
        entryDate,
        exitShares: sell.shares,
        exitPrice,
        exitDate,
        fee: totalFee,
        tax: totalTax,
        pnl: grossPnl,
        netPnl,
        pnlPercent,
        notes: `${firstItem.description} (Importiert aus Broker-Export)`,
        selected: true,
      });
      continue;
    }

    // Fall 2: Nur Käufe vorhanden (Offene Positionen)
    if (buys.length > 0 && sells.length === 0) {
      const totalShares = buys.reduce((sum, b) => sum + b.shares, 0);
      const totalCost = buys.reduce((sum, b) => sum + (b.shares * b.price), 0);
      const avgPrice = Number((totalCost / totalShares).toFixed(4));
      const totalFee = Number(buys.reduce((sum, b) => sum + b.fee, 0).toFixed(2));
      const totalTax = Number(buys.reduce((sum, b) => sum + b.tax, 0).toFixed(2));
      const entryDate = buys[0].time ? `${buys[0].date}T${buys[0].time}Z` : `${buys[0].date}T00:00:00Z`;

      candidates.push({
        isin: firstItem.isin,
        originalDescription: firstItem.description,
        symbol,
        type,
        side,
        broker,
        status: TradeStatus.OPEN,
        shares: totalShares,
        entryShares: totalShares,
        entryPrice: avgPrice,
        entryDate,
        fee: totalFee,
        tax: totalTax,
        notes: `${firstItem.description} (Offene Position)`,
        selected: true,
      });
      continue;
    }

    // Fall 3: Mehrere Käufe und Verkäufe (Teilverkauf oder mehrere Trades)
    let remainingBuyShares = buys.reduce((sum, b) => sum + b.shares, 0);
    const totalSellShares = sells.reduce((sum, s) => sum + s.shares, 0);

    const buyCost = buys.reduce((sum, b) => sum + (b.shares * b.price), 0);
    const avgEntryPrice = buys.length > 0 ? Number((buyCost / remainingBuyShares).toFixed(4)) : 0;

    const sellRevenue = sells.reduce((sum, s) => sum + (s.shares * s.price), 0);
    const avgExitPrice = totalSellShares > 0 ? Number((sellRevenue / totalSellShares).toFixed(4)) : 0;

    const totalFee = Number(items.reduce((sum, i) => sum + i.fee, 0).toFixed(2));
    const totalTax = Number(items.reduce((sum, i) => sum + i.tax, 0).toFixed(2));

    const isClosed = totalSellShares >= remainingBuyShares && remainingBuyShares > 0;
    const entryDate = buys[0]?.time ? `${buys[0].date}T${buys[0].time}Z` : `${buys[0]?.date || ''}T00:00:00Z`;
    const exitDate = sells[sells.length - 1]?.time ? `${sells[sells.length - 1].date}T${sells[sells.length - 1].time}Z` : `${sells[sells.length - 1]?.date || ''}T00:00:00Z`;

    const closedShares = Math.min(remainingBuyShares, totalSellShares);
    const multiplier = side === TradeSide.LONG ? 1 : -1;
    const grossPnl = closedShares > 0 ? Number(((avgExitPrice - avgEntryPrice) * closedShares * multiplier).toFixed(2)) : 0;
    const netPnl = Number((grossPnl - totalFee - totalTax).toFixed(2));
    const pnlPercent = avgEntryPrice > 0 ? Number((((avgExitPrice - avgEntryPrice) / avgEntryPrice) * 100 * multiplier).toFixed(2)) : 0;

    candidates.push({
      isin: firstItem.isin,
      originalDescription: firstItem.description,
      symbol,
      type,
      side,
      broker,
      status: isClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
      shares: Math.max(0, remainingBuyShares - totalSellShares),
      entryShares: remainingBuyShares,
      entryPrice: avgEntryPrice,
      entryDate,
      exitShares: totalSellShares > 0 ? totalSellShares : undefined,
      exitPrice: totalSellShares > 0 ? avgExitPrice : undefined,
      exitDate: totalSellShares > 0 ? exitDate : undefined,
      fee: totalFee,
      tax: totalTax,
      pnl: grossPnl,
      netPnl,
      pnlPercent,
      notes: `${firstItem.description}`,
      selected: true,
    });
  }

  return candidates;
}
