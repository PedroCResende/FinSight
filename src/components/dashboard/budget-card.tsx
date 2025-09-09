'use client';

import type { Budget, Category } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';

interface BudgetCardProps {
  budget?: Budget;
  category?: Category;
}

export function BudgetCard({ budget, category }: BudgetCardProps) {
  if (!budget || !category) {
    return null;
  }

  const { limit, current } = budget;
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const displayPercentage = Math.min(percentage, 100);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const overspentAmount = current - limit;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {category.icon && <category.icon className="h-5 w-5" style={{ color: category.color }} />}
            {category.name}
          </CardTitle>
          <CardDescription>
            {formatCurrency(current)} / {formatCurrency(limit)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={displayPercentage} indicatorClassName={getProgressColor()} />
          <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}% Gasto</p>
        </div>
        
        {percentage > 100 && (
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite Ultrapassado!</AlertTitle>
            <AlertDescription>
              Você ultrapassou o limite de {category.name} em {formatCurrency(overspentAmount)}.
            </AlertDescription>
          </Alert>
        )}

        {percentage >= 80 && percentage <= 100 && (
            <Alert className="border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                    Você já usou {Math.round(percentage)}% do seu orçamento para {category.name}.
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
    </Card>
  );
}
