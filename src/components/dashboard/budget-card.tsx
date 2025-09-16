'use client';

import type { Budget, Category, Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { predictSpending } from '@/ai/flows/predictive-analysis-flow';
import type { PredictiveAnalysisOutput } from '@/ai/flows/predictive-analysis-flow';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetCardProps {
  budget?: Budget;
  category?: Category;
  transactions?: Transaction[];
}

export function BudgetCard({ budget, category, transactions = [] }: BudgetCardProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
  
  const handleAnalysisClick = async () => {
    setIsAnalysisOpen(true);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
        const result = await predictSpending({
            transactions: transactions.map(t => ({...t, amount: Math.abs(t.amount)})), // Ensure amount is positive for analysis
            budgetLimit: budget.limit,
            categoryName: category.name,
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            monthName: format(new Date(), 'MMMM', { locale: ptBR }),
        });
        setAnalysisResult(result);
    } catch(error) {
        console.error("Error fetching predictive analysis:", error);
        setAnalysisError("Não foi possível obter a análise. Tente novamente mais tarde.");
    } finally {
        setIsAnalyzing(false);
    }
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {category.icon && <category.icon className="h-5 w-5" style={{ color: category.color }} />}
              {category.name}
            </CardTitle>
             <CardDescription>
                {formatCurrency(current)} / {formatCurrency(limit)}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleAnalysisClick} title="Análise Preditiva de Gastos">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </Button>
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
              Você ultrapassou o limite em {formatCurrency(overspentAmount)}.
            </AlertDescription>
          </Alert>
        )}

        {percentage >= 80 && percentage <= 100 && (
            <Alert className="border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                    Você já usou {Math.round(percentage)}% do seu orçamento.
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
    </Card>

    <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    Análise Preditiva: {category.name}
                </DialogTitle>
                <DialogDescription>
                    Nossa IA analisou seus gastos neste mês para prever o resultado final.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analisando seus hábitos de consumo...</span>
                    </div>
                )}
                {analysisError && <p className="text-destructive text-center">{analysisError}</p>}
                {analysisResult && (
                    <div className="space-y-4">
                        <Alert variant={analysisResult.isOnTrack ? 'default' : 'destructive'}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{analysisResult.isOnTrack ? "Tudo sob controle!" : "Alerta de Ritmo!"}</AlertTitle>
                            <AlertDescription>
                                {analysisResult.prediction}
                            </AlertDescription>
                        </Alert>
                        <div className="p-4 bg-muted/50 rounded-lg">
                             <p className="font-semibold text-sm mb-2">Recomendação da IA:</p>
                             <p className="text-muted-foreground text-sm">{analysisResult.insight}</p>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
