
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

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export function CategoryManager({ categories, setCategories }: CategoryManagerProps) {
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
    const iconObject = ICON_LIST.find(item => item.icon === category.icon) || ICON_LIST[0];
    setSelectedIcon(iconObject);
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  const handleSave = () => {
    if (!categoryName) return;

    if (currentCategory?.id) {
      // Edit existing
      setCategories(
        categories.map((c) =>
          c.id === currentCategory.id
            ? { ...c, name: categoryName, icon: selectedIcon.icon }
            : c
        )
      );
    } else {
      // Add new
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        name: categoryName,
        icon: selectedIcon.icon,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      setCategories([...categories, newCategory]);
    }
    setIsDialogOpen(false);
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
