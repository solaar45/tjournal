"use client";

import { useState } from 'react';
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

// Zod Schema für Validierung
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
  entryShares: z
    .number({
      required_error: 'Anzahl beim Einstieg ist erforderlich',
      invalid_type_error: 'Muss eine Zahl sein',
    })
    .positive('Anzahl muss größer als 0 sein')
    .int('Anzahl muss eine ganze Zahl sein'),
  entryPrice: z
    .number({
      required_error: 'Einstiegspreis ist erforderlich',
      invalid_type_error: 'Muss eine Zahl sein',
    })
    .positive('Preis muss größer als 0 sein'),
  entryDate: z.date({
    required_error: 'Einstiegsdatum ist erforderlich',
  }),
  exitShares: z
    .number()
    .positive('Anzahl muss größer als 0 sein')
    .int('Anzahl muss eine ganze Zahl sein')
    .optional()
    .or(z.literal(undefined)),
  exitPrice: z
    .number()
    .positive('Ausstiegspreis muss größer als 0 sein')
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
    message: 'Wenn ein Ausstiegspreis angegeben wird, müssen auch Anzahl und Datum ausgefüllt werden',
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
  const createTrade = useCreateTrade();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: '',
      type: TradeType.AKTIE,
      side: TradeSide.LONG,
      broker: undefined,
      entryShares: undefined,
      entryPrice: undefined,
      entryDate: new Date(),
      exitShares: undefined,
      exitPrice: undefined,
      exitDate: undefined,
    },
  });

  const exitPrice = form.watch('exitPrice');
  const exitShares = form.watch('exitShares');
  const hasExitData = exitPrice !== undefined || exitShares !== undefined;

  async function onSubmit(data: TradeFormValues) {
    const isFullyExited = 
      data.exitPrice !== undefined && 
      data.exitShares !== undefined && 
      data.exitShares === data.entryShares;
    
    const status = isFullyExited ? TradeStatus.CLOSED : TradeStatus.OPEN;
    const remainingShares = data.exitShares 
      ? data.entryShares - data.exitShares 
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
      exitPrice: data.exitPrice,
      exitShares: data.exitShares,
      exitDate: data.exitDate?.toISOString(),
    };

    createTrade.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast.success('Trade erfolgreich erstellt');
      },
      onError: (error) => {
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
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Trade erfassen</DialogTitle>
          <DialogDescription>
            Erfasse die Details deines Trades. Einstiegsdaten sind Pflicht, Ausstiegsdaten optional.
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
                        placeholder="AAPL"
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
                      defaultValue={field.value}
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
                      defaultValue={field.value}
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value ?? ''}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createTrade.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createTrade.isPending}>
                {createTrade.isPending ? (
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
                  'Trade erstellen'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
