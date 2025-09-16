'use client';
import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { Budget, Category, Transaction } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getBudgets, addBudget, updateBudget, deleteBudget, getCategories, getTransactions } from '@/services/firestore';
import { findIconComponent } from '@/components/dashboard/icon-picker';
import { useAchievements } from '@/contexts/achievements-context';


export default function BudgetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkAndUnlockAchievement } = useAchievements();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  const [limit, setLimit] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [firestoreBudgets, firestoreCategories, firestoreTransactions] = await Promise.all([
            getBudgets(user.uid),
            getCategories(user.uid),
            getTransactions(user.uid),
        ]);

        const categoriesWithIcons = firestoreCategories.map(c => ({
          ...c,
          icon: findIconComponent(c.icon as string)!,
        }));
        setCategories(categoriesWithIcons);
        setBudgets(firestoreBudgets);
        setTransactions(firestoreTransactions);
      };

      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!user || budgets.length === 0 || transactions.length === 0) return;

    const lastMonth = subMonths(new Date(), 1);
    const lastMonthString = format(lastMonth, 'yyyy-MM');
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);

    const currentMonth = new Date();
    const currentMonthString = format(currentMonth, 'yyyy-MM');
    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthEnd = endOfMonth(currentMonth);
    
    // Check 'reducedCategorySpendingBy15Percent'
    budgets.forEach(budget => {
        const lastMonthSpending = transactions
            .filter(t => t.categoryId === budget.categoryId && new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd && t.amount < 0)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        
        const currentMonthSpending = transactions
            .filter(t => t.categoryId === budget.categoryId && new Date(t.date) >= currentMonthStart && new Date(t.date) <= currentMonthEnd && t.amount < 0)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        if (lastMonthSpending > 0 && currentMonthSpending < lastMonthSpending * 0.85) {
            checkAndUnlockAchievement('reducedCategorySpendingBy15Percent');
        }
    });

    // Check 'spentUnderBudget'
    const lastMonthBudgets = budgets.filter(b => b.month === lastMonthString);
    if (lastMonthBudgets.length > 0) {
        const allUnderBudget = lastMonthBudgets.every(budget => {
            const spent = transactions
                .filter(t => t.categoryId === budget.categoryId && new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd && t.amount < 0)
                .reduce((acc, t) => acc + Math.abs(t.amount), 0);
            return spent <= budget.limit;
        });

        if (allUnderBudget) {
            checkAndUnlockAchievement('spentUnderBudget');
        }
    }
    
    // Check 'spent20PercentUnderBudget'
    if (lastMonthBudgets.length > 0) {
        const totalBudget = lastMonthBudgets.reduce((acc, b) => acc + b.limit, 0);
        const totalSpent = transactions
            .filter(t => new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd && t.amount < 0 && lastMonthBudgets.some(b => b.categoryId === t.categoryId))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        if (totalBudget > 0 && totalSpent <= totalBudget * 0.8) {
            checkAndUnlockAchievement('spent20PercentUnderBudget');
        }
    }


  }, [budgets, transactions, user, checkAndUnlockAchievement]);


  const activeBudgets = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return budgets.filter(budget => budget.month === currentMonth);
  }, [budgets]);
  
  const transactionsForCurrentMonth = useMemo(() => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    return transactions.filter(t => {
        const transactionDate = new Date(t.date.replace(/-/g, '/'));
        return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });
  }, [transactions]);


  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Desconhecida';
  };

  const openDialogForNew = () => {
    setCurrentBudget({});
    setLimit('');
    setSelectedCategoryId('');
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (budget: Budget) => {
    setCurrentBudget(budget);
    setLimit(String(budget.limit));
    setSelectedCategoryId(budget.categoryId);
    setIsDialogOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (!user) return;
    try {
        await deleteBudget(user.uid, budgetId);
        setBudgets(budgets.filter(b => b.id !== budgetId));
        toast({ title: 'Sucesso', description: 'Orçamento deletado.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao deletar', description: 'Não foi possível deletar o orçamento.' });
    }
  };

  const handleSave = async () => {
    if (!user || !limit || !selectedCategoryId) return;

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
        toast({ variant: 'destructive', title: 'Valor Inválido', description: 'Por favor, insira um limite válido.' });
        return;
    };

    try {
        if (currentBudget?.id) {
          // Edit existing
          const updatedData = { limit: numericLimit };
          await updateBudget(user.uid, currentBudget.id, updatedData);
          setBudgets(
            budgets.map(b =>
              b.id === currentBudget.id ? { ...b, ...updatedData } : b
            )
          );
           toast({ title: 'Sucesso', description: 'Orçamento atualizado.' });
        } else {
          // Add new
          const newBudgetData: Omit<Budget, 'id'> = {
            categoryId: selectedCategoryId,
            limit: numericLimit,
            current: 0,
            month: format(new Date(), 'yyyy-MM'),
          };
          const newId = await addBudget(user.uid, newBudgetData);
          setBudgets([...budgets, { id: newId, ...newBudgetData }]);
          checkAndUnlockAchievement('firstBudgetCreated');
          toast({ title: 'Sucesso', description: 'Orçamento criado.' });
        }
        setIsDialogOpen(false);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Ocorreu um erro ao salvar o orçamento.' });
    }
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <Card>
            <CardHeader>
                <CardTitle>Orçamentos do Mês</CardTitle>
                <CardDescription>Acompanhe seus limites de gastos para o mês <span className="font-bold text-primary">ATUAL</span>.</CardDescription>
            </CardHeader>
            <CardContent>
                {activeBudgets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeBudgets.map(budget => {
                      const budgetTransactions = transactionsForCurrentMonth.filter(
                          t => t.categoryId === budget.categoryId && t.amount < 0
                      );
                      return (
                        <BudgetCard 
                            key={budget.id} 
                            budget={budget} 
                            category={categories.find(c => c.id === budget.categoryId)}
                            transactions={budgetTransactions}
                        />
                      )
                    })}
                </div>
                ) : (
                <p className="text-center text-muted-foreground">Nenhum orçamento definido para este mês. Crie um abaixo.</p>
                )}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Gerenciar Orçamentos</CardTitle>
                    <CardDescription>Crie e gerencie seus orçamentos mensais por categoria.</CardDescription>
                </div>
                <Button onClick={openDialogForNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Orçamento
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="divide-y divide-border">
                {budgets.map((budget) => (
                  <div key={budget.id} className="flex items-center p-4">
                    <div className="flex-1">
                      <p className="font-medium">{getCategoryName(budget.categoryId)}</p>
                      <p className="text-sm text-muted-foreground">Limite: {formatCurrency(budget.limit)} / mês ({budget.month})</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(budget)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {budgets.length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">Nenhum orçamento encontrado.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentBudget?.id ? 'Editar Orçamento' : 'Adicionar Orçamento'}</DialogTitle>
            <DialogDescription>
              {currentBudget?.id ? 'Atualize o limite para esta categoria.' : 'Defina um novo limite de gastos para uma categoria.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Categoria</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={!!currentBudget?.id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} disabled={budgets.some(b => b.categoryId === cat.id && b.id !== currentBudget?.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="limit" className="text-right">Limite (R$)</Label>
              <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="col-span-3" placeholder="Ex: 500.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
