"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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

// Zod Schema für Validierung - use z.coerce for number fields
const tradeFormSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol ist erforderlich')
    .max(10, 'Symbol darf maximal 10 Zeichen lang sein')
    .regex(/^[A-Z0-9]+$/, 'Symbol muss aus Großbuchstaben und Zahlen bestehen'),
  type: z.nativeEnum(TradeType, {
    required_error: 'Bitte wähle einen Trade-Typ',
  }),
  side: z.nativeEnum(TradeSide, {
    required_error: 'Bitte wähle Long oder Short',
  }),
  broker: z.nativeEnum(Broker).optional(),
  entryShares: z.coerce
    .number({
      required_error: 'Anzahl beim Einstieg ist erforderlich',
      invalid_type_error: 'Muss eine Zahl sein',
    })
    .positive('Anzahl muss größer als 0 sein')
    .int('Anzahl muss eine ganze Zahl sein'),
  entryPrice: z.coerce
    .number({
      required_error: 'Einstiegspreis ist erforderlich',
      invalid_type_error: 'Muss eine Zahl sein',
    })
    .positive('Preis muss größer als 0 sein'),
  entryDate: z.date({
    required_error: 'Einstiegsdatum ist erforderlich',
  }),
  exitShares: z.coerce
    .number()
    .positive('Anzahl muss größer als 0 sein')
    .int('Anzahl muss eine ganze Zahl sein')
    .optional()
    .or(z.literal('')),
  exitPrice: z.coerce
    .number()
    .positive('Ausstiegspreis muss größer als 0 sein')
    .optional()
    .or(z.literal('')),
  exitDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.exitPrice && data.exitPrice !== '') {
      return (data.exitShares && data.exitShares !== '') && data.exitDate !== undefined;
    }
    return true;
  },
  {
    message: 'Wenn ein Ausstiegspreis angegeben wird, müssen auch Anzahl und Datum ausgefüllt werden',
    path: ['exitPrice'],
  }
).refine(
  (data) => {
    if (data.exitShares && data.exitShares !== '' && data.entryShares) {
      return data.exitShares <= data.entryShares;
    }
    return true;
  },
  {
    message: 'Ausstiegsmenge darf nicht größer als Einstiegsmenge sein',
    path: ['exitShares'],
  }
);

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  trigger?: React.ReactNode;
}

export function TradeForm({ trigger }: TradeFormProps) {
  const [open, setOpen] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);
  const createTrade = useCreateTrade();
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Get smart defaults
  const smartDefaults = getSmartDefaults();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
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
  const hasExitData = (exitPrice && exitPrice !== '') || (exitShares && exitShares !== '');

  async function onSubmit(data: TradeFormValues) {
    // Convert empty strings to undefined
    const exitSharesNum = data.exitShares === '' ? undefined : data.exitShares;
    const exitPriceNum = data.exitPrice === '' ? undefined : data.exitPrice;
    
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
        toast.success('Trade erfolgreich erstellt');
        
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
        toast.error('Fehler beim Erstellen des Trades: ' + error.message);
      },
    });
  }

  // Handle form errors
  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
    const errorMessages = Object.entries(errors)
      .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
      .join(', ');
    toast.error('Formularfehler: ' + errorMessages);
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
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Neuer Trade
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>N
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Trade erfassen</DialogTitle>
          <DialogDescription>
            Erfasse die Details deines Trades. Einstiegsdaten sind Pflicht, Ausstiegsdaten optional.
            <span className="block mt-1 text-xs opacity-75">⌨️ Tipp: Tab zum nächsten Feld, Enter zum Speichern, Esc zum Abbrechen</span>
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
                    <FormLabel>Symbol *</FormLabel>
                    <FormControl>
                      <Input
                        ref={symbolInputRef}
                        placeholder="AAPL"
                        autoComplete="off"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>Ticker-Symbol (z.B. AAPL, BTC)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wähle einen Typ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TradeType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                    <FormLabel>Seite *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Long oder Short" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TradeSide).map((side) => (
                          <SelectItem key={side} value={side}>
                            {side}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Broker</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wähle einen Broker" />
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
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">Einstieg (Pflicht)</h3>
            </div>

            {/* Entry: Shares & Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Anzahl beim Einstieg</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einstiegspreis *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="180.50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Preis pro Anteil in €</FormDescription>
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
                  <FormLabel>Einstiegsdatum *</FormLabel>
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
                            format(field.value, 'dd.MM.yyyy')
                          ) : (
                            <span>Datum wählen</span>
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
              <h3 className="text-sm font-medium mb-2">Ausstieg (Optional)</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Fülle diese Felder nur aus, wenn du bereits (teilweise) ausgestiegen bist.
              </p>
            </div>

            {/* Exit: Shares & Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exitShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verkaufte Anzahl</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Anzahl beim Ausstieg (max. Einstiegsmenge)
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
                    <FormLabel>Ausstiegspreis</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="185.20"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Preis pro Anteil in €</FormDescription>
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
                  <FormLabel>Ausstiegsdatum</FormLabel>
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
                            format(field.value, 'dd.MM.yyyy')
                          ) : (
                            <span>Datum wählen</span>
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
                  <strong>Hinweis:</strong> Da du Ausstiegsdaten eingegeben hast, wird dieser Trade 
                  {exitShares === form.watch('entryShares') 
                    ? ' als "Geschlossen" ' 
                    : ' als "Offen" (Teilverkauf) '}
                  markiert.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTrade.isPending}
              >
                Abbrechen
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
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
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    Speichern & Neu
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                      <span className="text-xs">⌘</span>⏎
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
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    Speichern
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
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
