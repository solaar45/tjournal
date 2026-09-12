"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradeForm } from '@/components/trade-form';
import { CsvImportDialog } from '@/components/csv-import-dialog';
import { useTranslation } from '@/i18n/LanguageContext';
import { TradeType } from '@/types/trade';
import { Download } from 'lucide-react';

export type TimeframeFilter = 'all' | 'year' | 'month' | 'week' | 'today';

interface FilterToolbarProps {
  timeframe: TimeframeFilter;
  onTimeframeChange: (tf: TimeframeFilter) => void;
  assetType: string;
  onAssetTypeChange: (type: string) => void;
  onExportCsv?: () => void;
  filteredTradesCount: number;
}

export function FilterToolbar({
  timeframe,
  onTimeframeChange,
  assetType,
  onAssetTypeChange,
  onExportCsv,
  filteredTradesCount,
}: FilterToolbarProps) {
  const { t } = useTranslation();

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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b border-border/60">
      {/* Left: Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Timeframe Pills */}
        <div className="flex items-center p-1 rounded-full bg-muted/70 border border-border/50 text-xs">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
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
        <div className="flex items-center p-1 rounded-full bg-muted/70 border border-border/50 text-xs overflow-x-auto">
          {assetTypes.map((at) => (
            <button
              key={at.id}
              onClick={() => onAssetTypeChange(at.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                assetType === at.id
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {at.label}
            </button>
          ))}
        </div>

        <Badge variant="secondary" className="text-[11px] font-mono h-6 px-2.5 rounded-full ml-1">
          {filteredTradesCount} {filteredTradesCount === 1 ? t.calendar.trade : t.calendar.trades}
        </Badge>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        {onExportCsv && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            {t.filters.exportCsv}
          </Button>
        )}
        <CsvImportDialog />
        <TradeForm />
      </div>
    </div>
  );
}
