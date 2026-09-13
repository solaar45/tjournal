"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateTrade } from '@/hooks/useTrades';
import { TradeType, TradeSide, TradeStatus, Broker } from '@/types/trade';
import { useTranslation } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

// LocalStorage keys for smart defaults
const STORAGE_KEYS = {
  LAST_BROKER: 'tjournal_last_broker',
  LAST_TYPE: 'tjournal_last_type',
  LAST_SHARES: 'tjournal_last_shares',
};

// Get smart defaults from localStorage
const getSmartDefaults = () => {
  if (typeof window === 'undefined') {
    return {
      broker: undefined,
      type: TradeType.AKTIE,
      shares: '',
    };
  }

  return {
    broker: localStorage.getItem(STORAGE_KEYS.LAST_BROKER) as Broker | undefined,
    type: (localStorage.getItem(STORAGE_KEYS.LAST_TYPE) as TradeType) || TradeType.AKTIE,
    shares: localStorage.getItem(STORAGE_KEYS.LAST_SHARES) || '',
  };
};

// Save smart defaults to localStorage
const saveSmartDefaults = (broker?: Broker, type?: TradeType, shares?: number) => {
  if (typeof window === 'undefined') return;
  
  if (broker) localStorage.setItem(STORAGE_KEYS.LAST_BROKER, broker);
  if (type) localStorage.setItem(STORAGE_KEYS.LAST_TYPE, type);
  if (shares) localStorage.setItem(STORAGE_KEYS.LAST_SHARES, shares.toString());
};

// Zod Schema for validation - use z.coerce for number fields
const tradeFormSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol cannot exceed 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Symbol must contain only uppercase letters and digits'),
  type: z.nativeEnum(TradeType, {
    message: 'Please select an asset type',
  }),
  side: z.nativeEnum(TradeSide, {
    message: 'Please select Long or Short',
  }),
  broker: z.nativeEnum(Broker).optional(),
  entryShares: z.coerce
    .number({
      message: 'Entry shares must be a number',
    })
    .positive('Shares must be greater than 0')
    .int('Shares must be an integer'),
  entryPrice: z.coerce
    .number({
      message: 'Entry price must be a number',
    })
    .positive('Price must be greater than 0'),
  entryDate: z.date({
    message: 'Entry date is required',
  }),
  exitShares: z.coerce
    .number()
    .positive('Shares must be greater than 0')
    .int('Shares must be an integer')
    .optional()
    .or(z.literal('')),
  exitPrice: z.coerce
    .number()
    .positive('Exit price must be greater than 0')
    .optional()
    .or(z.literal('')),
  exitDate: z.date().optional(),
}).refine(
  (data) => {
    const hasExitPrice = typeof data.exitPrice === 'number' && data.exitPrice > 0;
    const hasExitShares = typeof data.exitShares === 'number' && data.exitShares > 0;
    if (hasExitPrice) {
      return hasExitShares && data.exitDate !== undefined;
    }
    return true;
  },
  {
    message: 'When exit price is specified, exit shares and date are also required',
    path: ['exitPrice'],
  }
).refine(
  (data) => {
    if (typeof data.exitShares === 'number' && data.exitShares > 0 && typeof data.entryShares === 'number') {
      return data.exitShares <= data.entryShares;
    }
    return true;
  },
  {
    message: 'Exit shares cannot exceed entry shares',
    path: ['exitShares'],
  }
);

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  trigger?: React.ReactNode;
}

export function TradeForm({ trigger }: TradeFormProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);
  const createTrade = useCreateTrade();
  const symbolInputRef = useRef<HTMLInputElement>(null);

  const getTradeTypeLabel = (type: TradeType) => {
    switch (type) {
      case TradeType.AKTIE:
        return t.forms.stock;
      case TradeType.ZERTIFIKAT:
        return t.forms.certificate;
      case TradeType.OPTIONSSCHEIN:
        return t.forms.warrant;
      case TradeType.KRYPTO:
        return t.forms.crypto;
      default:
        return type;
    }
  };

  // Get smart defaults
  const smartDefaults = getSmartDefaults();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema) as any,
    defaultValues: {
      symbol: '',
      type: smartDefaults.type,
      side: TradeSide.LONG, // Most trades are Long
      broker: smartDefaults.broker,
      entryShares: smartDefaults.shares as any,
      entryPrice: '' as any,
      entryDate: new Date(), // Today by default
      exitShares: '' as any,
      exitPrice: '' as any,
      exitDate: undefined,
    },
  });

  // Auto-focus on symbol field when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        symbolInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Global keyboard shortcut: Ctrl/Cmd + N to open dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const exitPrice = form.watch('exitPrice');
  const exitShares = form.watch('exitShares');
  const hasExitData = Boolean(exitPrice) || Boolean(exitShares);

  async function onSubmit(data: TradeFormValues) {
    // Convert empty or zero values to undefined
    const exitSharesNum = typeof data.exitShares === 'number' && data.exitShares > 0 ? data.exitShares : undefined;
    const exitPriceNum = typeof data.exitPrice === 'number' && data.exitPrice > 0 ? data.exitPrice : undefined;
    
    const isFullyExited = 
      exitPriceNum !== undefined && 
      exitSharesNum !== undefined && 
      exitSharesNum === data.entryShares;
    
    const status = isFullyExited ? TradeStatus.CLOSED : TradeStatus.OPEN;
    const remainingShares = exitSharesNum 
      ? data.entryShares - exitSharesNum 
      : data.entryShares;

    const payload = {
      symbol: data.symbol.toUpperCase(),
      type: data.type,
      side: data.side,
      broker: data.broker,
      status: status,
      shares: remainingShares,
      entryPrice: data.entryPrice,
      entryShares: data.entryShares,
      entryDate: data.entryDate.toISOString(),
      exitPrice: exitPriceNum,
      exitShares: exitSharesNum,
      exitDate: data.exitDate?.toISOString(),
    };

    console.log('Submitting payload:', payload);

    // Save smart defaults for next time
    saveSmartDefaults(data.broker, data.type, data.entryShares);

    createTrade.mutate(payload, {
      onSuccess: () => {
        toast.success(t.forms.successCreated);
        
        if (saveAndNew) {
          // Reset form but keep smart defaults
          form.reset({
            symbol: '',
            type: data.type,
            side: TradeSide.LONG,
            broker: data.broker,
            entryShares: data.entryShares as any,
            entryPrice: '' as any,
            entryDate: new Date(),
            exitShares: '' as any,
            exitPrice: '' as any,
            exitDate: undefined,
          });
          setSaveAndNew(false);
          // Re-focus symbol field
          setTimeout(() => symbolInputRef.current?.focus(), 100);
        } else {
          setOpen(false);
          form.reset();
        }
      },
      onError: (error) => {
        console.error('API Error:', error);
        toast.error((language === 'de' ? 'Fehler beim Erstellen des Trades: ' : 'Error creating trade: ') + error.message);
      },
    });
  }

  // Handle form errors
  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
      .join(', ');
    toast.error((language === 'de' ? 'Formularfehler: ' : 'Form errors: ') + errorMessages);
  };

  // Handle Save & New
  const handleSaveAndNew = () => {
    setSaveAndNew(true);
    form.handleSubmit(onSubmit, onError)();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="h-9 px-4 text-sm font-semibold gap-2 rounded-xl">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{t.forms.newTrade}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>{t.forms.newTrade}</DialogTitle>
          <DialogDescription>
            {language === 'de' ? 'Erfasse die Details deines Trades. Einstiegsdaten sind Pflicht, Ausstiegsdaten optional.' : 'Log the details of your trade. Entry details are required, exit details are optional.'}
            <span className="block mt-1 text-xs opacity-75">
              {language === 'de' ? '⌨️ Tipp: Tab zum nächsten Feld, Enter zum Speichern, Esc zum Abbrechen' : '⌨️ Tip: Tab for next field, Enter to save, Esc to cancel'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
            {/* Symbol & Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.symbol} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AAPL"
                        autoComplete="off"
                        {...field}
                        ref={(e) => {
                          field.ref(e);
                          if (symbolInputRef) {
                            (symbolInputRef as any).current = e;
                          }
                        }}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Ticker-Symbol (z.B. AAPL, BTC)' : 'Ticker symbol (e.g. AAPL, BTC)'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.type} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.forms.assetType} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TradeType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {getTradeTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Side & Broker */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="side"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.side} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'de' ? 'Long oder Short' : 'Long or Short'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TradeSide.LONG}>
                          {t.common.long}
                        </SelectItem>
                        <SelectItem value={TradeSide.SHORT}>
                          {t.common.short}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="broker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.broker}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.forms.selectBroker} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Broker).map((broker) => (
                          <SelectItem key={broker} value={broker}>
                            {broker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{language === 'de' ? 'Optional' : 'Optional'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">{t.dashboard.entryGroup} ({language === 'de' ? 'Pflicht' : 'Required'})</h3>
            </div>

            {/* Entry: Shares & Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.entryShares} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Anzahl beim Einstieg' : 'Number of shares/units'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.entryPrice} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="180.50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Preis pro Anteil in €' : 'Price per share in €'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.forms.entryDate} *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, language === 'de' ? 'dd.MM.yyyy' : 'MMM dd, yyyy')
                          ) : (
                            <span>{language === 'de' ? 'Datum wählen' : 'Pick a date'}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Divider */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">{t.dashboard.exitGroup} ({language === 'de' ? 'Optional' : 'Optional'})</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {language === 'de' ? 'Fülle diese Felder nur aus, wenn du bereits (teilweise) ausgestiegen bist.' : 'Only fill these fields if you have already (partially) exited.'}
              </p>
            </div>

            {/* Exit: Shares & Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exitShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.exitShares}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'de' ? 'Anzahl beim Ausstieg (max. Einstiegsmenge)' : 'Shares sold (max. entry shares)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.exitPrice}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="185.20"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Preis pro Anteil in €' : 'Price per share in €'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Exit Date */}
            <FormField
              control={form.control}
              name="exitDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.forms.exitDate}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, language === 'de' ? 'dd.MM.yyyy' : 'MMM dd, yyyy')
                          ) : (
                            <span>{language === 'de' ? 'Datum wählen' : 'Pick a date'}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Hint */}
            {hasExitData && (
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  <strong>{language === 'de' ? 'Hinweis:' : 'Note:'}</strong>{' '}
                  {exitShares === form.watch('entryShares') 
                    ? (language === 'de' ? 'Da du Ausstiegsdaten eingegeben hast, wird dieser Trade als "Geschlossen" markiert.' : 'Since exit data was entered, this trade will be marked as "Closed".')
                    : (language === 'de' ? 'Da du Ausstiegsdaten eingegeben hast, wird dieser Trade als "Offen" (Teilverkauf) markiert.' : 'Since partial exit data was entered, this trade remains "Open" (Partial Exit).')}
                </p>
              </div>
            )}

            <DialogFooter className="flex-wrap items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTrade.isPending}
              >
                {t.common.cancel}
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium opacity-100">
                  Esc
                </kbd>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAndNew}
                disabled={createTrade.isPending}
              >
                {createTrade.isPending && saveAndNew ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.forms.saving}
                  </>
                ) : (
                  <>
                    {language === 'de' ? 'Speichern & Neu' : 'Save & New'}
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium opacity-100">
                      <span>⌘</span>⏎
                    </kbd>
                  </>
                )}
              </Button>
              <Button type="submit" disabled={createTrade.isPending}>
                {createTrade.isPending && !saveAndNew ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.forms.saving}
                  </>
                ) : (
                  <>
                    {t.forms.saveTrade}
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium opacity-100">
                      ⏎
                    </kbd>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
