
'use client';
import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, type LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/types';
import { IconPicker, ICON_LIST } from './icon-picker';
import * as firestoreService from '@/services/firestore';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export function CategoryManager({ categories, setCategories }: CategoryManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<{ name: string, icon: LucideIcon }>(ICON_LIST[0]);

  const openDialogForNew = () => {
    setCurrentCategory({});
    setCategoryName('');
    setSelectedIcon(ICON_LIST[0]);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    // The icon coming from props is already a component, find the corresponding object in ICON_LIST
    const iconObject = ICON_LIST.find(item => item.icon === category.icon) || ICON_LIST[0];
    setSelectedIcon(iconObject);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!user) return;
    try {
      await firestoreService.deleteCategory(user.uid, categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      toast({ title: 'Sucesso', description: 'Categoria excluída.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a categoria.' });
    }
  };

  const handleSave = async () => {
    if (!categoryName || !user) return;

    const categoryData = {
      name: categoryName,
      icon: selectedIcon.name, // Always save the icon name as a string
      color: currentCategory?.color || `hsl(${Math.random() * 360}, 70%, 50%)`,
    };

    try {
      if (currentCategory?.id) {
        // Edit existing
        await firestoreService.updateCategory(user.uid, currentCategory.id, categoryData);
        setCategories(
          categories.map((c) =>
            c.id === currentCategory!.id ? { ...c, ...categoryData, icon: selectedIcon.icon } : c
          )
        );
        toast({ title: 'Sucesso', description: 'Categoria atualizada.' });
      } else {
        // Add new
        const newCategoryId = await firestoreService.addCategory(user.uid, categoryData);
        const newCategory: Category = {
          id: newCategoryId,
          ...categoryData,
          icon: selectedIcon.icon, // convert name to component for local state
        };
        setCategories([...categories, newCategory]);
        toast({ title: 'Sucesso', description: 'Categoria criada.' });
      }
      setIsDialogOpen(false);
    } catch (e) {
       console.error("Failed to save category:", e);
       toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a categoria.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Categorias</CardTitle>
        <CardDescription>Crie, edite ou exclua suas categorias de gastos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={openDialogForNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
          </Button>
          <div className="rounded-md border">
            <div className="divide-y divide-border">
              {categories.map((category) => {
                const IconComponent = category.icon as LucideIcon;
                return (
                  <div key={category.id} className="flex items-center p-4">
                    <IconComponent className="h-5 w-5 mr-4" style={{ color: category.color }} />
                    <span className="flex-1 font-medium">{category.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {categories.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">Nenhuma categoria encontrada.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {currentCategory?.id ? 'Atualize os detalhes da sua categoria.' : 'Crie uma nova categoria para acompanhar seus gastos.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="icon" className="text-right">Ícone</Label>
               <div className="col-span-3">
                 <IconPicker selectedIcon={selectedIcon.icon} setSelectedIcon={(iconComponent) => {
                     const iconObject = ICON_LIST.find(i => i.icon === iconComponent) || ICON_LIST[0];
                     setSelectedIcon(iconObject);
                 }} />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
