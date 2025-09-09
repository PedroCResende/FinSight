'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Transaction, Category, Budget, UserAchievement, Goal } from '@/lib/types';
import { Header } from '@/components/dashboard/header';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { IncomeChart } from '@/components/dashboard/income-chart';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { CategoryManager } from '@/components/dashboard/category-manager';
import { TransactionUploader } from '@/components/dashboard/transaction-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_GOALS } from '@/lib/mock-data';
import type { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { AchievementsDisplay } from '@/components/dashboard/achievements-display';
import { MOCK_USER_ACHIEVEMENTS, ALL_ACHIEVEMENTS } from '@/lib/achievements-data';
import { TimelineView } from '@/components/dashboard/timeline-view';
import { HeatmapView } from '@/components/dashboard/heatmap-view';
import { GoalCard } from '@/components/dashboard/goal-card';
import { LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SmartQuery } from '@/components/dashboard/smart-query';
import Link from 'next/link';

// Custom hook to check for achievements
const useCheckAchievements = (transactions: Transaction[], setUnlockedAchievements: React.Dispatch<React.SetStateAction<UserAchievement[]>>) => {
  useEffect(() => {
    // Check for "Primeira Conquista"
    const hasCategorizedTransaction = transactions.some(t => t.category);
    if (hasCategorizedTransaction) {
      setUnlockedAchievements(prev => {
        if (!prev.some(a => a.achievementId === 'ach_1')) {
          return [...prev, { achievementId: 'ach_1', unlockedAt: new Date() }];
        }
        return prev;
      });
    }
     // Add more checks here for other achievements in the future
  }, [transactions, setUnlockedAchievements]);
};


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>(MOCK_USER_ACHIEVEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('standard');
   const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');


  useCheckAchievements(transactions, setUnlockedAchievements);


  const handleSetTransactions = (newTransactions: Transaction[]) => {
    const newTxsWithIds = newTransactions.map((tx, index) => ({
      ...tx,
      id: `tx_${Date.now()}_${index}`,
    }));
    setTransactions((prev) => [...prev, ...newTxsWithIds]);
  };

  const updateTransactionCategory = (transactionId: string, categoryId: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId ? { ...t, category: categoryId } : t
      )
    );
  };
  
    const handleAddContribution = () => {
    if (!contributionGoal || !contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    setGoals(
      goals.map(g => {
        if (g.id === contributionGoal.id) {
          const newSavedAmount = g.savedAmount + amount;
          return {
            ...g,
            savedAmount: newSavedAmount,
            status: newSavedAmount >= g.targetAmount ? 'completed' : g.status,
          };
        }
        return g;
      })
    );
    setContributionGoal(null);
    setContributionAmount('');
  };


  const filteredTransactions = useMemo(() => {
     return transactions.filter(transaction => {
      const searchTermMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
      
      const transactionDate = new Date(transaction.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
      const dateMatch = dateRange?.from && dateRange?.to
        ? transactionDate >= dateRange.from && transactionDate <= dateRange.to
        : true;

      return searchTermMatch && categoryMatch && dateMatch;
    });
  }, [transactions, searchTerm, categoryFilter, dateRange]);

  const activeGoals = useMemo(() => {
      return goals.filter(goal => goal.status === 'in-progress');
  }, [goals]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">

        <SmartQuery transactions={transactions} categories={categories} goals={goals} />

        <div className="flex justify-end">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList>
                    <TabsTrigger value="standard"><LayoutGrid className="mr-2 h-4 w-4" /> Visão Padrão</TabsTrigger>
                    <TabsTrigger value="alternative"><List className="mr-2 h-4 w-4" /> Visão Alternativa</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>


       {viewMode === 'standard' && (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                    <CardTitle>Visão Geral de Saídas</CardTitle>
                    <CardDescription>Sua distribuição de gastos por categoria.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                    <SpendingChart transactions={filteredTransactions} categories={categories} />
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                    <CardTitle>Visão Geral de Entradas</CardTitle>
                    <CardDescription>Suas fontes de receita.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                    <IncomeChart transactions={filteredTransactions} />
                    </CardContent>
                </Card>
            </div>
        </>
       )}

       {viewMode === 'alternative' && (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
                 <TimelineView transactions={filteredTransactions} categories={categories} />
            </div>
            <div className="lg:col-span-2">
                <HeatmapView transactions={filteredTransactions} />
            </div>
        </div>
       )}

        <Card>
            <CardHeader>
                <CardTitle>Suas Metas Financeiras</CardTitle>
                <CardDescription>Acompanhe o progresso em direção aos seus objetivos.</CardDescription>
            </CardHeader>
            <CardContent>
                 {activeGoals.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onContributeClick={() => setContributionGoal(goal)} />
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-muted-foreground">Nenhuma meta ativa no momento. Vá para a página de metas para criar uma.</p>
                 )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Suas Conquistas</CardTitle>
                    <CardDescription>
                        {unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length} conquistas desbloqueadas
                    </CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/achievements">
                        Ver Todas <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <AchievementsDisplay
                    allAchievements={ALL_ACHIEVEMENTS}
                    unlockedAchievementIds={unlockedAchievements.map(a => a.achievementId)}
                />
            </CardContent>
        </Card>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <div className="space-y-4">
              <TransactionUploader onUpload={handleSetTransactions} />
              <TransactionList
                transactions={filteredTransactions}
                categories={categories}
                onUpdateTransactionCategory={updateTransactionCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </div>
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManager categories={categories} setCategories={setCategories} />
          </TabsContent>
        </Tabs>
      </main>

        <Dialog open={!!contributionGoal} onOpenChange={() => setContributionGoal(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Contribuição</DialogTitle>
                    <DialogDescription>
                        Quanto você gostaria de adicionar à sua meta "{contributionGoal?.title}"?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="contribution" className="text-left">Valor da Contribuição (R$)</Label>
                    <Input 
                        id="contribution" 
                        type="number" 
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Ex: 100.00"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setContributionGoal(null)}>Cancelar</Button>
                    <Button onClick={handleAddContribution}>Salvar Contribuição</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
