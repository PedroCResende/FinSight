'use client';
import { useState } from 'react';
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
import type { Budget, Category } from '@/lib/types';
import { MOCK_BUDGETS, MOCK_CATEGORIES } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget> | null>(null);
  const [limit, setLimit] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

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

  const handleDelete = (budgetId: string) => {
    setBudgets(budgets.filter(b => b.id !== budgetId));
  };

  const handleSave = () => {
    if (!limit || !selectedCategoryId) return;

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) return;

    if (currentBudget?.id) {
      // Edit existing
      setBudgets(
        budgets.map(b =>
          b.id === currentBudget.id ? { ...b, categoryId: selectedCategoryId, limit: numericLimit } : b
        )
      );
    } else {
      // Add new
      const newBudget: Budget = {
        id: `bud_${Date.now()}`,
        categoryId: selectedCategoryId,
        limit: numericLimit,
        current: 0,
        month: format(new Date(), 'yyyy-MM'),
      };
      setBudgets([...budgets, newBudget]);
    }
    setIsDialogOpen(false);
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
