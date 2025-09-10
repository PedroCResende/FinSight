'use client';
import { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, CalendarIcon } from 'lucide-react';
import type { Goal } from '@/lib/types';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GoalCard } from '@/components/dashboard/goal-card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getGoals, addGoal, updateGoal, deleteGoal } from '@/services/firestore';

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal> | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  // State for contribution dialog
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    if (user) {
      const fetchGoals = async () => {
        const firestoreGoals = await getGoals(user.uid);
        setGoals(firestoreGoals);
      };
      fetchGoals();
    }
  }, [user]);

  const openDialogForNew = () => {
    setCurrentGoal({});
    setTitle('');
    setTargetAmount('');
    setDeadline(undefined);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (goal: Goal) => {
    setCurrentGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setDeadline(new Date(goal.deadline));
    setIsDialogOpen(true);
  };

  const handleDelete = async (goalId: string) => {
    if (!user) return;
    try {
      await deleteGoal(user.uid, goalId);
      setGoals(goals.filter(g => g.id !== goalId));
      toast({ title: 'Sucesso', description: 'Meta deletada.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar', description: 'Não foi possível deletar a meta.' });
    }
  };

  const handleSave = async () => {
    if (!user || !title || !targetAmount || !deadline) {
        toast({ variant: 'destructive', title: 'Campos Incompletos', description: 'Por favor, preencha todos os campos.' });
        return;
    }

    const numericAmount = parseFloat(targetAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({ variant: 'destructive', title: 'Valor Inválido', description: 'Por favor, insira um valor alvo válido.' });
        return;
    }

    try {
      if (currentGoal?.id) {
        // Edit existing
        const updatedData = { title, targetAmount: numericAmount, deadline };
        await updateGoal(user.uid, currentGoal.id, updatedData);
        setGoals(
          goals.map(g =>
            g.id === currentGoal.id ? { ...g, ...updatedData } : g
          )
        );
        toast({ title: 'Sucesso', description: 'Meta atualizada.' });
      } else {
        // Add new
        const newGoalData: Omit<Goal, 'id' | 'createdAt'> = {
          title,
          targetAmount: numericAmount,
          savedAmount: 0,
          deadline,
          status: 'in-progress',
        };
        const newId = await addGoal(user.uid, newGoalData);
        // Optimistic update - for better UX, we can refetch or just add locally
        const newGoal = { ...newGoalData, id: newId, createdAt: new Date() }; // Approximate createdAt
        setGoals([...goals, newGoal]);
        toast({ title: 'Sucesso', description: 'Meta criada.' });
      }
      setIsDialogOpen(false);
    } catch(error) {
       toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Ocorreu um erro ao salvar a meta.' });
    }
  };

  const handleAddContribution = async () => {
    if (!user || !contributionGoal || !contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Valor Inválido', description: 'Por favor, insira um valor de contribuição válido.' });
        return;
    }

    const newSavedAmount = contributionGoal.savedAmount + amount;
    const newStatus = newSavedAmount >= contributionGoal.targetAmount ? 'completed' : contributionGoal.status;

    try {
        await updateGoal(user.uid, contributionGoal.id, { savedAmount: newSavedAmount, status: newStatus });
        setGoals(
          goals.map(g => 
            g.id === contributionGoal.id ? { ...g, savedAmount: newSavedAmount, status: newStatus } : g
          )
        );
        toast({ title: 'Sucesso', description: `Contribuição de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} adicionada!` });
        setContributionGoal(null);
        setContributionAmount('');
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar a contribuição.' });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Gerenciar Metas</CardTitle>
                <CardDescription>Defina e acompanhe suas metas financeiras.</CardDescription>
              </div>
              <Button onClick={openDialogForNew} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Meta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onContributeClick={setContributionGoal}
                  onEditClick={openDialogForEdit}
                  onDeleteClick={handleDelete}
                />
              ))}
              {goals.length === 0 && (
                <p className="p-4 text-center text-muted-foreground col-span-full">Nenhuma meta encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog for Edit/Create Goal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentGoal?.id ? 'Editar Meta' : 'Adicionar Nova Meta'}</DialogTitle>
            <DialogDescription>
              {currentGoal?.id ? 'Atualize os detalhes da sua meta.' : 'Defina um novo objetivo para suas economias.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Título</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" placeholder="Ex: Viagem para a Europa" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">Valor Alvo (R$)</Label>
              <Input id="target" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="col-span-3" placeholder="Ex: 5000.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="deadline" className="text-right">Prazo Final</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn('col-span-3 justify-start text-left font-normal', !deadline && 'text-muted-foreground')}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        disabled={(date) => date < startOfDay(new Date())}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Dialog for Add Contribution */}
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
