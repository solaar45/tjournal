"use client";

import { useState, useEffect } from 'react';
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
import { useUpdateTrade } from '@/hooks/useTrades';
import { Trade, TradeType, TradeSide, TradeStatus, Broker } from '@/types/trade';
import { useTranslation } from '@/i18n/LanguageContext';

const editTradeFormSchema = z.object({
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
  entryShares: z
    .number({
      message: 'Entry shares must be a number',
    })
    .positive('Shares must be greater than 0')
    .int('Shares must be an integer'),
  entryPrice: z
    .number({
      message: 'Entry price must be a number',
    })
    .positive('Price must be greater than 0'),
  entryDate: z.date({
    message: 'Entry date is required',
  }),
  exitShares: z
    .number()
    .positive('Shares must be greater than 0')
    .int('Shares must be an integer')
    .optional()
    .or(z.literal(undefined)),
  exitPrice: z
    .number()
    .positive('Exit price must be greater than 0')
    .optional()
    .or(z.literal(undefined)),
  exitDate: z.date().optional().or(z.literal(undefined)),
}).refine(
  (data) => {
    if (data.exitPrice !== undefined) {
      return data.exitShares !== undefined && data.exitDate !== undefined;
    }
    return true;
  },
  {
    message: 'When exit price is specified, exit shares and date are also required',
    path: ['exitPrice'],
  }
).refine(
  (data) => {
    if (data.exitShares !== undefined && data.entryShares !== undefined) {
      return data.exitShares <= data.entryShares;
    }
    return true;
  },
  {
    message: 'Exit shares cannot exceed entry shares',
    path: ['exitShares'],
  }
);

type EditTradeFormValues = z.infer<typeof editTradeFormSchema>;

interface EditTradeDialogProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTradeDialog({ trade, open, onOpenChange }: EditTradeDialogProps) {
  const { t, language } = useTranslation();
  const updateTrade = useUpdateTrade();

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

  const calculateExitShares = (trade: Trade): number | undefined => {
    if (!trade.exitPrice) return undefined;
    const entryShares = trade.entryShares || trade.shares;
    const exitShares = trade.exitShares;
    if (exitShares !== undefined) return exitShares;
    if (trade.status === TradeStatus.CLOSED) return entryShares;
    if (trade.shares < entryShares) return entryShares - trade.shares;
    return undefined;
  };

  const form = useForm<EditTradeFormValues>({
    resolver: zodResolver(editTradeFormSchema),
    defaultValues: {
      symbol: trade.symbol,
      type: trade.type,
      side: trade.side,
      broker: trade.broker,
      entryShares: trade.entryShares || trade.shares,
      entryPrice: trade.entryPrice,
      entryDate: new Date(trade.entryDate),
      exitShares: calculateExitShares(trade),
      exitPrice: trade.exitPrice || undefined,
      exitDate: trade.exitDate ? new Date(trade.exitDate) : undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        symbol: trade.symbol,
        type: trade.type,
        side: trade.side,
        broker: trade.broker,
        entryShares: trade.entryShares || trade.shares,
        entryPrice: trade.entryPrice,
        entryDate: new Date(trade.entryDate),
        exitShares: calculateExitShares(trade),
        exitPrice: trade.exitPrice || undefined,
        exitDate: trade.exitDate ? new Date(trade.exitDate) : undefined,
      });
    }
  }, [trade, open, form]);

  const exitPrice = form.watch('exitPrice');
  const exitShares = form.watch('exitShares');
  const entryShares = form.watch('entryShares');
  const hasExitData = exitPrice !== undefined || exitShares !== undefined;

  async function onSubmit(data: EditTradeFormValues) {
    const isFullyExited = 
      data.exitPrice !== undefined && 
      data.exitShares !== undefined && 
      data.exitShares === data.entryShares;
    
    const status = isFullyExited ? TradeStatus.CLOSED : TradeStatus.OPEN;
    const remainingShares = data.exitShares 
      ? data.entryShares - data.exitShares 
      : data.entryShares;

    const payload = {
      id: trade.id,
      symbol: data.symbol.toUpperCase(),
      type: data.type,
      side: data.side,
      broker: data.broker,
      status: status,
      shares: remainingShares,
      entryPrice: data.entryPrice,
      entryShares: data.entryShares,
      entryDate: data.entryDate.toISOString(),
      exitPrice: data.exitPrice,
      exitShares: data.exitShares,
      exitDate: data.exitDate?.toISOString(),
    };

    updateTrade.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>{t.forms.editTrade}</DialogTitle>
          <DialogDescription>
            {language === 'de' 
              ? 'Bearbeite die Details deines Trades. Du kannst z.B. einen Teilverkauf nachtragen.'
              : 'Edit the details of your trade or record an exit transaction.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        {...field}
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
                      defaultValue={field.value}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="side"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.side} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">{t.dashboard.entryGroup}</h3>
            </div>

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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Preis pro Anteil in €' : 'Price per share in €'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">{t.dashboard.exitGroup}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {language === 'de' 
                  ? 'Füge einen (Teil-)Verkauf hinzu oder aktualisiere bestehende Ausstiegsdaten.'
                  : 'Add or update exit transactions.'}
              </p>
            </div>

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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'de' 
                        ? `Anzahl beim Ausstieg (max. ${entryShares})`
                        : `Shares sold (max. ${entryShares})`}
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>{language === 'de' ? 'Preis pro Anteil in €' : 'Price per share in €'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {hasExitData && (
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  <strong>{language === 'de' ? 'Hinweis:' : 'Note:'}</strong>{' '}
                  {exitShares === entryShares
                    ? (language === 'de' ? 'Der Trade wird als "Geschlossen" markiert (vollständig verkauft).' : 'This trade will be marked as "Closed" (fully exited).')
                    : exitShares
                    ? (language === 'de' ? `Der Trade bleibt "Offen" (${(entryShares || 0) - exitShares} Anteile verbleiben).` : `This trade remains "Open" (${(entryShares || 0) - exitShares} shares remaining).`)
                    : (language === 'de' ? 'Bitte fülle alle Ausstiegsfelder aus.' : 'Please fill all exit fields.')}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateTrade.isPending}
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={updateTrade.isPending}>
                {updateTrade.isPending ? (
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
                  t.forms.updateTrade
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
