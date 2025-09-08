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
  DialogTrigger,
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
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon>(ICON_LIST[0].icon);

  const openDialogForNew = () => {
    setCurrentCategory({});
    setCategoryName('');
    setSelectedIcon(ICON_LIST[0].icon);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
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
          c.id === currentCategory.id ? { ...c, name: categoryName, icon: selectedIcon } : c
        )
      );
    } else {
      // Add new
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        name: categoryName,
        icon: selectedIcon,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      setCategories([...categories, newCategory]);
    }
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>Create, edit, or delete your spending categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={openDialogForNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
          </Button>
          <div className="rounded-md border">
            <div className="divide-y divide-border">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center p-4">
                  <category.icon className="h-5 w-5 mr-4 text-muted-foreground" style={{ color: category.color }} />
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
              ))}
              {categories.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No categories found.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {currentCategory?.id ? 'Update the details for your category.' : 'Create a new category to track your spending.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="icon" className="text-right">Icon</Label>
               <div className="col-span-3">
                 <IconPicker selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
