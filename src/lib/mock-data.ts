import type { Category, Transaction, Budget, Goal, UserAchievement } from './types';
import { Home, UtensilsCrossed, ShoppingBag, Car, Film } from 'lucide-react';
import { format, subDays, addMonths, startOfDay } from 'date-fns';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Supermercado', icon: ShoppingBag, color: 'hsl(142.1, 76.2%, 36.3%)' },
  { id: 'cat_2', name: 'Restaurantes', icon: UtensilsCrossed, color: 'hsl(22.1, 83.3%, 53.3%)' },
  { id: 'cat_3', name: 'Moradia', icon: Home, color: 'hsl(212, 45%, 53%)' },
  { id: 'cat_4', name: 'Transporte', icon: Car, color: 'hsl(346.8, 77.2%, 49.8%)' },
  { id: 'cat_5', name: 'Lazer', icon: Film, color: 'hsl(262.1, 83.3%, 57.8%)' },
];

const today = new Date();

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', date: format(subDays(today, 1), 'yyyy-MM-dd'), description: 'Supermercado Exemplo', amount: -75.4, category: 'cat_1' },
  { id: 'tx_2', date: format(subDays(today, 2), 'yyyy-MM-dd'), description: 'Restaurante Exemplo', amount: -15.25, category: 'cat_2' },
  { id: 'tx_3', date: format(subDays(today, 2), 'yyyy-MM-dd'), description: 'Assinatura Netflix', amount: -19.99, category: 'cat_5' },
  { id: 'tx_4', date: format(subDays(today, 3), 'yyyy-MM-dd'), description: 'Posto Shell', amount: -55.0, category: 'cat_4' },
  { id: 'tx_5', date: format(subDays(today, 4), 'yyyy-MM-dd'), description: 'Spotify', amount: -10.99 },
  { id: 'tx_6', date: format(subDays(today, 5), 'yyyy-MM-dd'), description: 'Contas de Consumo', amount: -120.0, category: 'cat_3' },
  { id: 'tx_7', date: format(subDays(today, 6), 'yyyy-MM-dd'), description: 'Starbucks', amount: -5.75 },
  { id: 'tx_8', date: format(subDays(today, 8), 'yyyy-MM-dd'), description: 'Depósito de Salário', amount: 2500.00 },
];

export const MOCK_BUDGETS: Budget[] = [
    { id: 'bud_1', categoryId: 'cat_1', limit: 300, current: 0, month: format(today, 'yyyy-MM') },
    { id: 'bud_2', categoryId: 'cat_2', limit: 100, current: 0, month: format(today, 'yyyy-MM') },
    { id: 'bud_3', categoryId: 'cat_4', limit: 150, current: 0, month: format(today, 'yyyy-MM') },
    { id: 'bud_4', categoryId: 'cat_5', limit: 80, current: 0, month: format(today, 'yyyy-MM') },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal_1',
    title: 'Viagem para a Amazônia',
    targetAmount: 5000,
    savedAmount: 1200,
    deadline: addMonths(startOfDay(today), 6),
    status: 'in-progress',
    createdAt: subDays(startOfDay(today), 60),
  },
  {
    id: 'goal_2',
    title: 'Comprar um Notebook Novo',
    targetAmount: 8000,
    savedAmount: 7500,
    deadline: addMonths(startOfDay(today), 1),
    status: 'in-progress',
    createdAt: subDays(startOfDay(today), 120),
  },
    {
    id: 'goal_3',
    title: 'Fundo de Emergência',
    targetAmount: 10000,
    savedAmount: 10000,
    deadline: addMonths(startOfDay(today), 12),
    status: 'completed',
    createdAt: subDays(startOfDay(today), 300),
  },
  {
    id: 'goal_4',
    title: 'Curso de Culinária',
    targetAmount: 800,
    savedAmount: 200,
    deadline: subDays(startOfDay(today), 10), // Prazo já passou
    status: 'failed',
    createdAt: subDays(startOfDay(today), 90),
  },
];
