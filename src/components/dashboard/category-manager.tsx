
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
import { IconPicker, ICON_LIST, findIconComponent, findIconInfo } from './icon-picker';
import { useAuth } from '@/contexts/auth-context';
import { addCategory, updateCategory, deleteCategory } from '@/services/firestore';
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
  const [selectedIconInfo, setSelectedIconInfo] = useState(ICON_LIST[0]);

  const openDialogForNew = () => {
    setCurrentCategory({});
    setCategoryName('');
    setSelectedIconInfo(ICON_LIST[0]);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    const iconInfo = findIconInfo(category.icon);
    setSelectedIconInfo(iconInfo || ICON_LIST[0]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para deletar categorias.' });
        return;
    }
    try {
        await deleteCategory(user.uid, categoryId);
        setCategories(categories.filter((c) => c.id !== categoryId));
        toast({ title: 'Sucesso', description: 'Categoria deletada.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao deletar', description: 'Não foi possível deletar a categoria.' });
    }
  };

  const handleSave = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para salvar categorias.' });
        return;
    }
    if (!categoryName) {
        toast({ variant: 'destructive', title: 'Erro de Validação', description: 'O nome da categoria não pode estar em branco.' });
        return;
    }

    try {
        if (currentCategory?.id) {
            // Edit existing
            const updatedData = { name: categoryName, icon: selectedIconInfo.name };
            await updateCategory(user.uid, currentCategory.id, updatedData);
            setCategories(
                categories.map((c) =>
                c.id === currentCategory.id
                    ? { ...c, name: categoryName, icon: selectedIconInfo.icon }
                    : c
                )
            );
            toast({ title: 'Sucesso', description: 'Categoria atualizada.' });
        } else {
            // Add new
            const newCategoryData = {
                name: categoryName,
                icon: selectedIconInfo.name,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            };
            const newId = await addCategory(user.uid, newCategoryData);
            const newCategory: Category = {
                id: newId,
                ...newCategoryData,
                icon: selectedIconInfo.icon,
            };
            setCategories([...categories, newCategory]);
            toast({ title: 'Sucesso', description: 'Categoria criada.' });
        }
        setIsDialogOpen(false);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Ocorreu um erro ao salvar a categoria no banco de dados.' });
        console.error("Error saving category: ", error);
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
                    {IconComponent ? 
                        <IconComponent className="h-5 w-5 mr-4" style={{ color: category.color }} /> :
                        <div className="h-5 w-5 mr-4" />
                    }
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
                <p className="p-4 text-center text-muted-foreground">Nenhuma categoria encontrada. Que tal criar uma?</p>
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
                 <IconPicker selectedIcon={selectedIconInfo.icon} setSelectedIcon={(iconComponent) => {
                     const iconInfo = findIconInfo(iconComponent);
                     if (iconInfo) setSelectedIconInfo(iconInfo);
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

    