
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
import type { Budget, Category, Transaction, UserAchievement } from '@/lib/types';
import { format } from 'date-fns';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getBudgets, addBudget, updateBudget, deleteBudget, getCategories, getTransactions } from '@/services/firestore';
import { findIconComponent } from '@/components/dashboard/icon-picker';
import { MOCK_USER_ACHIEVEMENTS, ALL_ACHIEVEMENTS } from '@/lib/achievements-data';


export default function BudgetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  const [limit, setLimit] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>(MOCK_USER_ACHIEVEMENTS);
  
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [firestoreBudgets, firestoreCategories, firestoreTransactions] = await Promise.all([
            getBudgets(user.uid),
            getCategories(user.uid),
            getTransactions(user.uid)
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
  
  const checkAchievement = (achievementId: string) => {
    if (!unlockedAchievements.some(a => a.achievementId === achievementId)) {
      setUnlockedAchievements(prev => [...prev, { achievementId: achievementId, unlockedAt: new Date() }]);
      const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        toast({
          title: '🏆 Conquista Desbloqueada!',
          description: `Você ganhou: "${achievement.title}"`,
        });
      }
    }
  };

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
          checkAchievement('ach_8'); // "Planejador" achievement
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
                      <p className="text-sm text-muted-foreground">Limite: {formatCurrency(budget.limit)} / mês</p>
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
