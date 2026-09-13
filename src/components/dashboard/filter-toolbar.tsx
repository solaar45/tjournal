"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradeForm } from '@/components/trade-form';
import { CsvImportDialog } from '@/components/csv-import-dialog';
import { useTranslation } from '@/i18n/LanguageContext';
import { TradeType } from '@/types/trade';
import { Upload, X } from 'lucide-react';
import { useTradeFilters, TimeframeFilter } from '@/context/trade-filter-context';

export type { TimeframeFilter };

interface FilterToolbarProps {
  timeframe?: TimeframeFilter;
  onTimeframeChange?: (tf: TimeframeFilter) => void;
  assetType?: string;
  onAssetTypeChange?: (type: string) => void;
  onExportCsv?: () => void;
  filteredTradesCount?: number;
}

export function FilterToolbar(props: FilterToolbarProps) {
  const { t } = useTranslation();
  const context = useTradeFilters();

  const timeframe = props.timeframe ?? context.timeframe;
  const onTimeframeChange = props.onTimeframeChange ?? ((tf: TimeframeFilter) => {
    context.setTimeframe(tf);
    context.setSelectedDate(null);
  });
  const assetType = props.assetType ?? context.assetType;
  const onAssetTypeChange = props.onAssetTypeChange ?? ((at: string) => {
    context.setAssetType(at);
    context.setSelectedDate(null);
  });
  const onExportCsv = props.onExportCsv ?? context.handleExportCsv;
  const filteredTradesCount = props.filteredTradesCount ?? context.filteredTrades.length;
  const selectedDate = context.selectedDate;

  const timeframes: { id: TimeframeFilter; label: string }[] = [
    { id: 'all', label: t.filters.allTime },
    { id: 'year', label: t.filters.thisYear },
    { id: 'month', label: t.filters.thisMonth },
    { id: 'week', label: t.filters.thisWeek },
    { id: 'today', label: t.filters.today },
  ];

  const assetTypes: { id: string; label: string }[] = [
    { id: 'all', label: t.filters.allTypes },
    { id: TradeType.AKTIE, label: t.forms.stock },
    { id: TradeType.ZERTIFIKAT, label: t.forms.certificate },
    { id: TradeType.OPTIONSSCHEIN, label: t.forms.warrant },
    { id: TradeType.KRYPTO, label: t.forms.crypto },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b border-border/60 w-full max-w-full min-w-0">
      {/* Left: Filter Pills */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto min-w-0 max-w-full">
        {/* Timeframe Pills */}
        <div className="flex items-center p-1 rounded-full bg-muted/70 border border-border/50 text-sm overflow-x-auto max-w-full scrollbar-none">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-3.5 py-1 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                timeframe === tf.id
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Asset Type Pills */}
        <div className="flex items-center p-1 rounded-full bg-muted/70 border border-border/50 text-sm overflow-x-auto max-w-full scrollbar-none">
          {assetTypes.map((at) => (
            <button
              key={at.id}
              onClick={() => onAssetTypeChange(at.id)}
              className={`px-3.5 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                assetType === at.id
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {at.label}
            </button>
          ))}
        </div>

        {/* Selected Date Filter Chip (from Calendar selection) */}
        {selectedDate && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-mono font-medium">
            <span>{selectedDate}</span>
            <button
              onClick={() => context.setSelectedDate(null)}
              className="hover:opacity-75 cursor-pointer ml-0.5"
              title="Clear date filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <Badge variant="secondary" className="text-sm font-mono h-8 px-3.5 rounded-full ml-1 font-semibold">
          {filteredTradesCount} {filteredTradesCount === 1 ? t.calendar.trade : t.calendar.trades}
        </Badge>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={filteredTradesCount === 0}
          className="h-9 text-sm gap-1.5 px-3.5 text-muted-foreground hover:text-foreground font-semibold"
        >
          <Upload className="h-4 w-4" />
          <span>{t.filters.exportCsv}</span>
        </Button>
        <CsvImportDialog />
        <TradeForm />
      </div>
    </div>
  );
}
