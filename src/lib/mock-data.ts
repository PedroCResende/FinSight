import type { Category, Transaction, Budget } from './types';
import { Home, UtensilsCrossed, ShoppingBag, Car, Film } from 'lucide-react';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Supermercado', icon: ShoppingBag, color: 'hsl(142.1, 76.2%, 36.3%)' },
  { id: 'cat_2', name: 'Restaurantes', icon: UtensilsCrossed, color: 'hsl(22.1, 83.3%, 53.3%)' },
  { id: 'cat_3', name: 'Moradia', icon: Home, color: 'hsl(212, 45%, 53%)' },
  { id: 'cat_4', name: 'Transporte', icon: Car, color: 'hsl(346.8, 77.2%, 49.8%)' },
  { id: 'cat_5', name: 'Lazer', icon: Film, color: 'hsl(262.1, 83.3%, 57.8%)' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', date: '2024-07-15', description: 'Supermercado Exemplo', amount: -75.4, category: 'cat_1' },
  { id: 'tx_2', date: '2024-07-14', description: 'Restaurante Exemplo', amount: -15.25, category: 'cat_2' },
  { id: 'tx_3', date: '2024-07-14', description: 'Assinatura Netflix', amount: -19.99, category: 'cat_5' },
  { id: 'tx_4', date: '2024-07-13', description: 'Posto Shell', amount: -55.0, category: 'cat_4' },
  { id: 'tx_5', date: '2024-07-12', description: 'Spotify', amount: -10.99 },
  { id: 'tx_6', date: '2024-07-11', description: 'Contas de Consumo', amount: -120.0, category: 'cat_3' },
  { id: 'tx_7', date: '2024-07-10', description: 'Starbucks', amount: -5.75 },
  { id: 'tx_8', date: '2024-07-09', description: 'Depósito de Salário', amount: 2500.00 },
];

export const MOCK_BUDGETS: Budget[] = [
    { id: 'bud_1', categoryId: 'cat_1', limit: 300, current: 0, month: '2024-07' },
    { id: 'bud_2', categoryId: 'cat_2', limit: 100, current: 0, month: '2024-07' },
    { id: 'bud_3', categoryId: 'cat_4', limit: 150, current: 0, month: '2024-07' },
    { id: 'bud_4', categoryId: 'cat_5', limit: 80, current: 0, month: '2024-07' },
];
