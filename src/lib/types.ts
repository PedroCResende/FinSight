import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon | string; // Allow string for icon name from DB
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // Should be ISO string
  description: string;
  amount: number;
  category?: Category['id'];
}

export interface Budget {
    id: string;
    categoryId: Category['id'];
    limit: number;
    current: number; 
    month: string; // YYYY-MM
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    condition: string;
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  status: 'in-progress' | 'completed' | 'failed';
  createdAt?: Date;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface SignUpCredentials extends LoginCredentials {
    name: string;
}
