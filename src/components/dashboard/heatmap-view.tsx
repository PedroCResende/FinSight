'use client';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { eachDayOfInterval, endOfMonth, format, startOfMonth, getDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HeatmapViewProps {
  transactions: Transaction[];
}

export function HeatmapView({ transactions }: HeatmapViewProps) {
  const today = new Date();

  const data = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) {
        const date = format(new Date(transaction.date.replace(/-/g, '/')), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + Math.abs(transaction.amount);
      }
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });
  const firstDayOfMonth = getDay(start); // 0 = Sunday, 1 = Monday, etc.

  const maxSpent = useMemo(() => Math.max(0, ...Object.values(data)), [data]);

  const getHeatColor = (value: number) => {
    if (value === 0 || !maxSpent) return 'bg-muted/30 hover:bg-muted/50';
    const intensity = Math.min(value / maxSpent, 1);
    if (intensity < 0.2) return 'bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800';
    if (intensity < 0.4) return 'bg-green-300 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-700';
    if (intensity < 0.6) return 'bg-yellow-300 hover:bg-yellow-400 dark:bg-yellow-800 dark:hover:bg-yellow-700';
    if (intensity < 0.8) return 'bg-orange-400 hover:bg-orange-500 dark:bg-orange-800 dark:hover:bg-orange-700';
    return 'bg-red-500 hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800';
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Mapa de Calor de Gastos</CardTitle>
        <CardDescription>
          Visualize seus dias de maiores gastos no mês de {format(today, 'MMMM', { locale: ptBR })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="font-semibold text-muted-foreground">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const formattedDate = format(day, 'yyyy-MM-dd');
              const spent = data[formattedDate] || 0;
              return (
                <Tooltip key={formattedDate}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-10 w-full rounded-md flex items-center justify-center transition-colors',
                        getHeatColor(spent),
                         !isSameMonth(day, today) && 'opacity-50',
                      )}
                    >
                      <span className="font-semibold text-foreground/70 mix-blend-difference">{format(day, 'd')}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{format(day, "d 'de' MMMM", { locale: ptBR })}</p>
                    <p>{spent > 0 ? `Gasto: ${formatCurrency(spent)}` : 'Nenhum gasto'}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
