import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: Category['id'];
}

export interface Budget {
    id: string;
    categoryId: Category['id'];
    limit: number;
    current: number; // This will be calculated on the fly for the mock version
    month: string; // YYYY-MM
}
