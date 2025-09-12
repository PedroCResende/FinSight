
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Transaction, Category, Goal } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { findIconComponent } from '@/components/dashboard/icon-picker';
import { PiggyBank, Target, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportData {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  dateRange?: DateRange;
  generatedAt: string;
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client-side after the component mounts.
    const savedData = localStorage.getItem('reportData');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Re-hydrate complex objects from their string representations
        const categoriesWithIcons = parsedData.categories.map((c: any) => ({
            ...c,
            icon: findIconComponent(c.icon as string)!, // Re-create icon component from name
        }));

        const goalsWithDates = parsedData.goals.map((g: any) => ({
            ...g,
            deadline: new Date(g.deadline), // Convert ISO string back to Date object
            createdAt: g.createdAt ? new Date(g.createdAt) : undefined,
        }));
        
        // Re-hydrate date range objects
        const dateRangeWithDates = parsedData.dateRange ? {
            from: parsedData.dateRange.from ? new Date(parsedData.dateRange.from) : undefined,
            to: parsedData.dateRange.to ? new Date(parsedData.dateRange.to) : undefined,
        } : undefined;

        setData({ ...parsedData, categories: categoriesWithIcons, goals: goalsWithDates, dateRange: dateRangeWithDates });
        
        // Trigger print dialog after a short delay to allow the page to fully render.
        setTimeout(() => window.print(), 1000);

      } catch (error) {
        console.error('Failed to parse or process report data:', error);
      } finally {
        // Clean up localStorage after use to avoid leaving sensitive data.
        localStorage.removeItem('reportData');
      }
    }
    
    setLoading(false);
  }, []);
  
  const financialSummary = useMemo(() => {
      if (!data) return { income: 0, expenses: 0, balance: 0 };
      const income = data.transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const expenses = data.transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
      const balance = income + expenses;
      return { income, expenses: Math.abs(expenses), balance };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (date: Date) => {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando relatório...</div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <PiggyBank className="h-16 w-16 mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Nenhum dado para o relatório</h1>
        <p className="text-muted-foreground">Volte para o dashboard e gere um relatório para visualizá-lo aqui.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Voltar para o Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8 report-container">
      <header className="mb-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <PiggyBank className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Relatório Financeiro</h1>
                    <p className="text-muted-foreground">Gerado em: {formatDate(new Date(data.generatedAt))}</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="font-semibold">Período do Relatório</h2>
                <p className="text-muted-foreground">
                {data.dateRange?.from ? formatDate(data.dateRange.from) : 'Início'} à {data.dateRange?.to ? formatDate(data.dateRange.to) : 'Fim'}
                </p>
            </div>
        </div>
      </header>

      <main className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-4">
                <ArrowUpCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                    <p className="text-sm text-green-800 dark:text-green-300">Total de Entradas</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">{formatCurrency(financialSummary.income)}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-4">
                <ArrowDownCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                <div>
                    <p className="text-sm text-red-800 dark:text-red-300">Total de Saídas</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-200">{formatCurrency(financialSummary.expenses)}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-4">
                <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">Saldo Final</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{formatCurrency(financialSummary.balance)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Despesas</CardTitle>
                        <CardDescription>Como seus gastos foram distribuídos por categoria.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendingChart transactions={data.transactions} categories={data.categories} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>Progresso das Metas</CardTitle>
                        <CardDescription>Acompanhamento de suas metas financeiras.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.goals.length > 0 ? data.goals.map(goal => (
                             <div key={goal.id}>
                                <div className="flex justify-between mb-1">
                                    <p className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> {goal.title}</p>
                                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>{goal.status === 'completed' ? 'Concluída' : 'Em Andamento'}</Badge>
                                </div>
                                <Progress value={(goal.savedAmount / goal.targetAmount) * 100} />
                                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <span>{formatCurrency(goal.savedAmount)}</span>
                                    <span>{formatCurrency(goal.targetAmount)}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-8">Nenhuma meta cadastrada.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhe das Transações</CardTitle>
            <CardDescription>Todas as transações registradas no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((t) => {
                  const category = data.categories.find(c => c.id === t.category);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{format(new Date(t.date.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{category?.name || 'N/A'}</TableCell>
                      <TableCell className={`text-right font-medium ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

       <footer className="mt-8 text-center text-xs text-muted-foreground print-footer">
            Relatório gerado por FinSight.
       </footer>

       <style jsx global>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .report-container {
                    padding: 0;
                }
                header, footer.print-footer {
                    display: block;
                }
                .no-print {
                    display: none;
                }
                main .card {
                    border: 1px solid #e2e8f0; /* Softer border for print */
                    box-shadow: none;
                }
            }
            @page {
                size: A4;
                margin: 0.75in;
            }
       `}</style>
    </div>
  );
}

    