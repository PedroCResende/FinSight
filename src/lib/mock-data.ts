import type { Category, Transaction } from './types';
import { Home, UtensilsCrossed, ShoppingBag, Car, Film } from 'lucide-react';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Groceries', icon: ShoppingBag, color: 'hsl(142.1, 76.2%, 36.3%)' },
  { id: 'cat_2', name: 'Dining Out', icon: UtensilsCrossed, color: 'hsl(22.1, 83.3%, 53.3%)' },
  { id: 'cat_3', name: 'Housing', icon: Home, color: 'hsl(212, 45%, 53%)' },
  { id: 'cat_4', name: 'Transportation', icon: Car, color: 'hsl(346.8, 77.2%, 49.8%)' },
  { id: 'cat_5', name: 'Entertainment', icon: Film, color: 'hsl(262.1, 83.3%, 57.8%)' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', date: '2024-07-15', description: 'Trader Joes', amount: -75.4, category: 'cat_1' },
  { id: 'tx_2', date: '2024-07-14', description: 'Sweetgreen', amount: -15.25, category: 'cat_2' },
  { id: 'tx_3', date: '2024-07-14', description: 'Netflix Subscription', amount: -19.99, category: 'cat_5' },
  { id: 'tx_4', date: '2024-07-13', description: 'Shell Gas Station', amount: -55.0, category: 'cat_4' },
  { id: 'tx_5', date: '2024-07-12', description: 'Spotify', amount: -10.99 },
  { id: 'tx_6', date: '2024-07-11', description: 'PG&E Utilities', amount: -120.0, category: 'cat_3' },
  { id: 'tx_7', date: '2024-07-10', description: 'Starbucks', amount: -5.75 },
  { id: 'tx_8', date: '2024-07-09', description: 'Income Deposit', amount: 2500.00 },
];
