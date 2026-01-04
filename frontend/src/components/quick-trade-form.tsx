"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCreateTrade } from '@/hooks/useTrades';
import { TradeType, TradeSide, TradeStatus, Broker } from '@/types/trade';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

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

// Minimalist schema - only essential fields
const quickTradeSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol erforderlich')
    .max(10, 'Max. 10 Zeichen')
    .regex(/^[A-Z0-9]+$/, 'Nur Großbuchstaben & Zahlen'),
  side: z.nativeEnum(TradeSide),
  entryShares: z.coerce
    .number({ invalid_type_error: 'Nur Zahlen' })
    .positive('Muss > 0 sein')
    .int('Nur ganze Zahlen'),
  entryPrice: z.coerce
    .number({ invalid_type_error: 'Nur Zahlen' })
    .positive('Muss > 0 sein'),
});

type QuickTradeValues = z.infer<typeof quickTradeSchema>;

interface QuickTradeFormProps {
  trigger?: React.ReactNode;
}

export function QuickTradeForm({ trigger }: QuickTradeFormProps) {
  const [open, setOpen] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);
  const createTrade = useCreateTrade();
  const symbolInputRef = useRef<HTMLInputElement>(null);

  const smartDefaults = getSmartDefaults();

  const form = useForm<QuickTradeValues>({
    resolver: zodResolver(quickTradeSchema),
    mode: 'onChange', // Enable inline validation
    defaultValues: {
      symbol: '',
      side: TradeSide.LONG,
      entryShares: smartDefaults.shares as any,
      entryPrice: '' as any,
    },
  });

  // Auto-focus on symbol field when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => symbolInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Global keyboard shortcut: Ctrl/Cmd + Q for Quick Entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
      // Ctrl/Cmd + Enter for Save & New
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && open) {
        e.preventDefault();
        handleSaveAndNew();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  async function onSubmit(data: QuickTradeValues) {
    const payload = {
      symbol: data.symbol.toUpperCase(),
      type: smartDefaults.type,
      side: data.side,
      broker: smartDefaults.broker,
      status: TradeStatus.OPEN,
      shares: data.entryShares,
      entryPrice: data.entryPrice,
      entryShares: data.entryShares,
      entryDate: new Date().toISOString(),
      exitPrice: undefined,
      exitShares: undefined,
      exitDate: undefined,
    };

    saveSmartDefaults(smartDefaults.broker, smartDefaults.type, data.entryShares);

    createTrade.mutate(payload, {
      onSuccess: () => {
        toast.success('✅ Trade erstellt');
        
        if (saveAndNew) {
          // Reset form but keep smart defaults
          form.reset({
            symbol: '',
            side: TradeSide.LONG,
            entryShares: data.entryShares as any,
            entryPrice: '' as any,
          });
          setSaveAndNew(false);
          setTimeout(() => symbolInputRef.current?.focus(), 100);
        } else {
          setOpen(false);
          form.reset();
        }
      },
      onError: (error) => {
        toast.error('❌ Fehler: ' + error.message);
      },
    });
  }

  const handleSaveAndNew = () => {
    setSaveAndNew(true);
    form.handleSubmit(onSubmit)();
  };

  // Get validation state for inline feedback
  const symbolError = form.formState.errors.symbol;
  const sharesError = form.formState.errors.entryShares;
  const priceError = form.formState.errors.entryPrice;

  const symbolValue = form.watch('symbol');
  const sharesValue = form.watch('entryShares');
  const priceValue = form.watch('entryPrice');

  // Visual states for inline validation
  const getInputState = (value: any, error: any) => {
    if (!value || value === '') return 'default';
    return error ? 'error' : 'success';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Quick Entry
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>Q
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Entry
          </DialogTitle>
          <DialogDescription>
            Schnelleingabe für neue Trades. Nur die wichtigsten Felder.
            <span className="block mt-1 text-xs opacity-75">⌨️ Tab → Enter zum Speichern | Ctrl+Enter für Speichern & Neu</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Symbol */}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Symbol *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        ref={symbolInputRef}
                        placeholder="AAPL"
                        autoComplete="off"
                        className={cn(
                          'text-lg h-12 pr-10',
                          getInputState(symbolValue, symbolError) === 'error' && 'border-red-500 focus-visible:ring-red-500',
                          getInputState(symbolValue, symbolError) === 'success' && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                      {/* Inline validation indicator */}
                      {symbolValue && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {symbolError ? (
                            <span className="text-red-500 text-xl">✗</span>
                          ) : (
                            <span className="text-green-500 text-xl">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {symbolError && (
                    <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                      {symbolError.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Side (Long/Short) - Radio Buttons */}
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Seite *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value={TradeSide.LONG} id="long" className="h-5 w-5" />
                        <Label htmlFor="long" className="text-base font-medium cursor-pointer flex-1 py-3 px-4 rounded-md border-2 border-input hover:border-primary transition-colors">
                          <span className="text-green-600 font-semibold">📈 Long</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value={TradeSide.SHORT} id="short" className="h-5 w-5" />
                        <Label htmlFor="short" className="text-base font-medium cursor-pointer flex-1 py-3 px-4 rounded-md border-2 border-input hover:border-primary transition-colors">
                          <span className="text-red-600 font-semibold">📉 Short</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Shares & Price in one row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Shares */}
              <FormField
                control={form.control}
                name="entryShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Anzahl *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="100"
                          autoComplete="off"
                          className={cn(
                            'text-lg h-12 pr-10',
                            getInputState(sharesValue, sharesError) === 'error' && 'border-red-500 focus-visible:ring-red-500',
                            getInputState(sharesValue, sharesError) === 'success' && 'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                        {sharesValue && sharesValue !== '' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {sharesError ? (
                              <span className="text-red-500 text-xl">✗</span>
                            ) : (
                              <span className="text-green-500 text-xl">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {sharesError && (
                      <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        {sharesError.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Preis (€) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="150.50"
                          autoComplete="off"
                          className={cn(
                            'text-lg h-12 pr-10',
                            getInputState(priceValue, priceError) === 'error' && 'border-red-500 focus-visible:ring-red-500',
                            getInputState(priceValue, priceError) === 'success' && 'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                        {priceValue && priceValue !== '' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {priceError ? (
                              <span className="text-red-500 text-xl">✗</span>
                            ) : (
                              <span className="text-green-500 text-xl">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {priceError && (
                      <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        {priceError.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Info Box */}
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span>ℹ️</span>
                <span>
                  Typ: <strong>{smartDefaults.type}</strong> | 
                  Datum: <strong>Heute</strong> | 
                  Status: <strong>Offen</strong>
                </span>
              </p>
              <p className="text-xs mt-1 opacity-75">
                Diese Standardwerte kannst du in der ausführlichen Eingabe ändern.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTrade.isPending}
                className="flex-1"
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
                disabled={createTrade.isPending || !form.formState.isValid}
                className="flex-1"
              >
                {createTrade.isPending && saveAndNew ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Speichert...
                  </>
                ) : (
                  <>
                    & Neu
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                      <span className="text-xs">⌘</span>↵
                    </kbd>
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={createTrade.isPending || !form.formState.isValid}
                className="flex-1"
              >
                {createTrade.isPending && !saveAndNew ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Speichert...
                  </>
                ) : (
                  <>
                    Speichern
                    <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                      ↵
                    </kbd>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
