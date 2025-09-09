'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Transaction, Category, Budget, UserAchievement } from '@/lib/types';
import { Header } from '@/components/dashboard/header';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { IncomeChart } from '@/components/dashboard/income-chart';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { CategoryManager } from '@/components/dashboard/category-manager';
import { TransactionUploader } from '@/components/dashboard/transaction-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS, MOCK_BUDGETS } from '@/lib/mock-data';
import type { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { AchievementsDisplay } from '@/components/dashboard/achievements-display';
import { MOCK_USER_ACHIEVEMENTS, ALL_ACHIEVEMENTS } from '@/lib/achievements-data';

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
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>(MOCK_USER_ACHIEVEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
   const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

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

  const activeBudgets = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return budgets
      .filter(budget => budget.month === currentMonth)
      .map(budget => {
        const spent = transactions
          .filter(t => t.category === budget.categoryId && t.amount < 0 && format(new Date(t.date), 'yyyy-MM') === currentMonth)
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        return {
          ...budget,
          current: spent,
        };
      });
  }, [budgets, transactions]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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

        <Card>
          <CardHeader>
            <CardTitle>Orçamentos do Mês</CardTitle>
            <CardDescription>Acompanhe seus limites de gastos para o mês atual.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBudgets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeBudgets.map(budget => (
                  <BudgetCard key={budget.id} budget={budget} category={categories.find(c => c.id === budget.categoryId)} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nenhum orçamento definido para este mês. Vá para a página de orçamentos para criar um.</p>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Suas Conquistas</CardTitle>
                <CardDescription>
                    {unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length} conquistas desbloqueadas
                </CardDescription>
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
    </div>
  );
}
