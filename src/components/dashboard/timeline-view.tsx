'use client';
import type { Transaction, Category } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineViewProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TimelineView({ transactions, categories }: TimelineViewProps) {

  const getCategoryFromId = (id: string) => categories.find((c) => c.id === id);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    try {
      const sanitizedDateString = dateString.replace(/-/g, '/');
      const date = new Date(sanitizedDateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return format(new Date(date.getTime() + userTimezoneOffset), "d 'de' MMMM", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const groupedTransactions = transactions
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .reduce((acc, tx) => {
    const date = formatDate(tx.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Linha do Tempo de Transações</CardTitle>
        <CardDescription>Uma visão cronológica de suas atividades financeiras.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {Object.keys(groupedTransactions).length > 0 ? (
             <div className="relative pl-6">
                <div className="absolute left-0 top-0 h-full w-px bg-border"></div>
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date} className="mb-8">
                        <div className="sticky top-0 z-10 -ml-6 mb-2 bg-background">
                            <div className="flex items-center gap-3">
                                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <span className="text-xs font-bold">{parseISO(txs[0].date).getDate()}</span>
                                </div>
                                <h3 className="text-md font-semibold text-foreground">{date}</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                        {txs.map((transaction) => {
                            const category = transaction.category ? getCategoryFromId(transaction.category) : null;
                            const Icon = category?.icon;
                            return (
                                <div key={transaction.id} className="flex items-start gap-4">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card" title={category?.name}>
                                    {Icon && <Icon className="h-5 w-5 text-muted-foreground" style={{ color: category?.color }} />}
                                </span>
                                <div className="flex-1">
                                    <p className="font-medium">{transaction.description}</p>
                                    <p className="text-sm text-muted-foreground">{category?.name || 'Não categorizado'}</p>
                                </div>
                                <div
                                    className={cn('font-semibold', transaction.amount < 0 ? 'text-red-500' : 'text-green-500')}
                                >
                                    {formatCurrency(transaction.amount)}
                                </div>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                ))}
             </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">Nenhuma transação no período selecionado.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
