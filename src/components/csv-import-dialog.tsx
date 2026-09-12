"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseBrokerCsv, processCsvToTrades, ImportCandidate } from '@/lib/csvImporter';
import { formatCurrency, formatPercent, formatDateSafe } from '@/lib/tradeUtils';
import { useCreateTrade } from '@/hooks/useTrades';
import { useTranslation } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle2, ArrowRight, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface CsvImportDialogProps {
  trigger?: React.ReactNode;
}

export function CsvImportDialog({ trigger }: CsvImportDialogProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTrade = useCreateTrade();

  const locale = language === 'de' ? 'de-DE' : 'en-US';
  const dateTimeFormat = language === 'de' ? 'dd.MM.yyyy HH:mm' : 'MMM dd, yyyy HH:mm';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processText(text);
    };
    reader.readAsText(file, 'utf-8');
  };

  const processText = (text: string) => {
    try {
      const rawRows = parseBrokerCsv(text);
      if (rawRows.length === 0) {
        toast.error(t.csvImport.errorNoPositions);
        return;
      }

      const trades = processCsvToTrades(rawRows);
      if (trades.length === 0) {
        toast.error(t.csvImport.errorNoPositions);
        return;
      }

      setCandidates(trades);
      toast.success(`${trades.length} ${t.csvImport.positionsDetected}`);
    } catch (err: any) {
      console.error('CSV Parsing Error:', err);
      toast.error(`${t.csvImport.errorParsing} ${err.message || 'Unknown'}`);
    }
  };

  const handleSymbolChange = (index: number, newSymbol: string) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        symbol: newSymbol.toUpperCase().trim(),
      };
      return updated;
    });
  };

  const handleToggleSelect = (index: number) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selected: !updated[index].selected,
      };
      return updated;
    });
  };

  const handleSelectAll = (select: boolean) => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: select })));
  };

  const handleImport = async () => {
    const selected = candidates.filter((c) => c.selected);
    if (selected.length === 0) {
      toast.error(language === 'de' ? 'Bitte wähle mindestens einen Trade aus.' : 'Please select at least one trade.');
      return;
    }

    setIsImporting(true);
    let successCount = 0;

    try {
      for (const trade of selected) {
        await createTrade.mutateAsync({
          symbol: trade.symbol || 'UNKNOWN',
          type: trade.type,
          side: trade.side,
          status: trade.status,
          shares: trade.shares,
          broker: trade.broker,
          entryDate: trade.entryDate,
          entryPrice: trade.entryPrice,
          entryShares: trade.entryShares,
          exitDate: trade.exitDate,
          exitPrice: trade.exitPrice,
          exitShares: trade.exitShares,
          fee: trade.fee,
          tax: trade.tax,
          notes: trade.notes,
        });
        successCount++;
      }

      toast.success(`${successCount} ${t.csvImport.successImported}`);
      setCandidates([]);
      setFileName('');
      setPastedText('');
      setOpen(false);
    } catch (err: any) {
      console.error('Import Error:', err);
      toast.error(`${language === 'de' ? 'Fehler beim Importieren: ' : 'Error importing: '}${err.message || 'Server error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = candidates.filter((c) => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            {t.csvImport.triggerButton}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-primary" />
            {t.csvImport.dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {t.csvImport.dialogDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Upload State or Table Preview */}
        {candidates.length === 0 ? (
          <div className="space-y-4 py-4">
            {!pasteMode ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">{t.csvImport.dropzoneTitle}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.csvImport.dropzoneSubtitle}
                </p>
                <Button variant="secondary" type="button" size="sm">
                  {t.csvImport.browseFile}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="w-full h-40 p-3 rounded-md border font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder={t.csvImport.textareaPlaceholder}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
                <Button
                  onClick={() => processText(pastedText)}
                  disabled={!pastedText.trim()}
                  className="w-full"
                >
                  {t.csvImport.analyzeText}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPasteMode(!pasteMode)}
                className="text-xs text-muted-foreground"
              >
                {pasteMode ? t.csvImport.backToUpload : t.csvImport.pasteDirectly}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{candidates.length} {t.csvImport.positionsDetected}</span>
                {fileName && <span className="text-xs text-muted-foreground">({fileName})</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                  className="text-xs h-7"
                >
                  {t.csvImport.selectAll}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                  className="text-xs h-7"
                >
                  {t.csvImport.selectNone}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCandidates([]);
                    setFileName('');
                    setPastedText('');
                  }}
                  className="text-xs h-7 gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t.csvImport.reload}
                </Button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="rounded-md border overflow-x-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead className="w-10 text-center">✓</TableHead>
                    <TableHead className="w-24">{t.table.symbol}</TableHead>
                    <TableHead>{t.common.type} & {t.common.side}</TableHead>
                    <TableHead>{t.dashboard.entryGroup}</TableHead>
                    <TableHead>{t.dashboard.exitGroup}</TableHead>
                    <TableHead className="text-right">{t.common.fee} / {t.common.tax}</TableHead>
                    <TableHead className="text-right">{t.common.net} P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate, idx) => {
                    const isClosed = candidate.status === 'closed';
                    const hasNetPnl = candidate.netPnl !== undefined;
                    const isWin = (candidate.netPnl || 0) > 0;

                    return (
                      <TableRow key={idx} className={candidate.selected ? '' : 'opacity-50'}>
                        {/* Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={!!candidate.selected}
                            onChange={() => handleToggleSelect(idx)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                        </TableCell>

                        {/* Editable Symbol */}
                        <TableCell>
                          <Input
                            value={candidate.symbol}
                            onChange={(e) => handleSymbolChange(idx, e.target.value)}
                            className="h-8 font-bold text-xs uppercase w-20"
                            title="Edit ticker symbol"
                          />
                        </TableCell>

                        {/* Typ & Side */}
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {candidate.type}
                              </Badge>
                              <span
                                className={`text-[11px] font-semibold flex items-center ${
                                  candidate.side === 'Long' ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {candidate.side === 'Long' ? (
                                  <ArrowUpRight className="h-3 w-3 inline" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 inline" />
                                )}
                                {candidate.side}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={candidate.originalDescription}>
                              {candidate.originalDescription}
                            </span>
                          </div>
                        </TableCell>

                        {/* Entry */}
                        <TableCell>
                          <div className="text-xs">
                            <span className="font-medium">{candidate.entryShares} {language === 'de' ? 'Stk.' : 'shares'}</span> @{' '}
                            <span>{formatCurrency(candidate.entryPrice, locale)}</span>
                            <div className="text-[10px] text-muted-foreground">
                              {formatDateSafe(candidate.entryDate, dateTimeFormat)}
                            </div>
                          </div>
                        </TableCell>

                        {/* Exit */}
                        <TableCell>
                          {isClosed && candidate.exitPrice ? (
                            <div className="text-xs">
                              <span className="font-medium">{candidate.exitShares || candidate.entryShares} {language === 'de' ? 'Stk.' : 'shares'}</span> @{' '}
                              <span>{formatCurrency(candidate.exitPrice, locale)}</span>
                              <div className="text-[10px] text-muted-foreground">
                                {formatDateSafe(candidate.exitDate, dateTimeFormat)}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              {t.csvImport.openPosition}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Fees & Taxes */}
                        <TableCell className="text-right text-xs">
                          <div>
                            {t.table.feeShort}: <span className="font-mono">{formatCurrency(candidate.fee || 0, locale)}</span>
                          </div>
                          <div>
                            {t.table.taxShort}: {candidate.tax !== undefined && candidate.tax < 0 ? (
                              <span className="font-mono text-emerald-600 font-medium" title={t.common.taxCredit}>
                                +{formatCurrency(Math.abs(candidate.tax), locale)}
                              </span>
                            ) : (
                              <span className="font-mono text-muted-foreground">{formatCurrency(candidate.tax || 0, locale)}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Net P&L */}
                        <TableCell className="text-right">
                          {isClosed && hasNetPnl ? (
                            <div className="text-xs">
                              <div className={`font-bold ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(candidate.netPnl || 0, locale)}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {t.table.grossShort}: {formatCurrency(candidate.pnl || 0, locale)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 <strong>{language === 'de' ? 'Tipp:' : 'Tip:'}</strong> {t.csvImport.symbolHint}
            </p>
          </div>
        )}

        <DialogFooter className="flex-wrap items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            {t.common.cancel}
          </Button>
          {candidates.length > 0 && (
            <Button onClick={handleImport} disabled={isImporting || selectedCount === 0} className="gap-1.5">
              {isImporting ? (
                <>{t.csvImport.importing}</>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t.csvImport.importSelected} ({selectedCount})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
