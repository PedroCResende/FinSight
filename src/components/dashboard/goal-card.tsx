'use client';

import type { Goal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { differenceInDays, differenceInMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Target, AlertCircle, PartyPopper, Frown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const { title, targetAmount, savedAmount, deadline, status, createdAt } = goal;

  const percentage = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
  const displayPercentage = Math.min(percentage, 100);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const today = new Date();
  const daysTotal = differenceInDays(deadline, createdAt);
  const daysLeft = differenceInDays(deadline, today);
  const timeProgress = daysTotal > 0 ? Math.max(0, ((daysTotal - daysLeft) / daysTotal) * 100) : 100;


  const getProgressColor = () => {
    if (status !== 'in-progress') return 'bg-gray-400';
    if (timeProgress > 80 && percentage < 80) return 'bg-red-500';
    if (timeProgress > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><PartyPopper className="mr-1 h-3 w-3" /> Concluída</Badge>;
      case 'failed':
        return <Badge variant="destructive"><Frown className="mr-1 h-3 w-3" /> Falhou</Badge>;
      default:
        return <Badge variant="secondary">Em Andamento</Badge>;
    }
  };
  
  const getSuggestion = () => {
    if (status !== 'in-progress' || savedAmount >= targetAmount) return null;

    const amountLeft = targetAmount - savedAmount;
    const monthsLeft = Math.max(1, differenceInMonths(deadline, today));
    
    const suggestionAmount = amountLeft / monthsLeft;

    return (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Guarde <b>{formatCurrency(suggestionAmount)}/mês</b> para atingir sua meta.</span>
        </p>
    );
  };


  return (
    <Card className={cn(
        "flex flex-col h-full",
        status === 'completed' && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        status === 'failed' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-80',
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {title}
            </CardTitle>
            {getStatusBadge()}
        </div>
        <CardDescription>
          Prazo: {format(deadline, 'dd/MM/yyyy', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
           <div className="flex justify-between text-sm font-medium">
                <span>{formatCurrency(savedAmount)}</span>
                <span className="text-muted-foreground">{formatCurrency(targetAmount)}</span>
           </div>
          <Progress value={displayPercentage} indicatorClassName={getProgressColor()} />
          <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}% Atingido</p>
        </div>
        
        {getSuggestion()}

      </CardContent>
      <CardFooter>
        {status === 'in-progress' && timeProgress > 80 && percentage < 100 && (
             <Alert className="border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção, prazo acabando!</AlertTitle>
                <AlertDescription>
                    Faltam apenas {Math.max(0, daysLeft)} dias para o fim do prazo.
                </AlertDescription>
            </Alert>
        )}
        {status === 'completed' && (
             <Alert variant="default" className="bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 [&>svg]:text-green-600 w-full">
                <PartyPopper className="h-4 w-4" />
                <AlertTitle>Parabéns!</AlertTitle>
                <AlertDescription>
                    Você alcançou sua meta!
                </AlertDescription>
            </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
