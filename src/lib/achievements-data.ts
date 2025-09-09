import type { Achievement, UserAchievement } from './types';
import { Award, Target, TrendingUp, Sparkles } from 'lucide-react';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'Primeira Conquista',
    description: 'Você categorizou sua primeira transação. O primeiro passo para a organização!',
    icon: Award,
    condition: 'firstCategorization',
  },
  {
    id: 'ach_2',
    title: 'Economista Iniciante',
    description: 'Você ficou dentro do orçamento em todas as categorias este mês. Ótimo controle!',
    icon: Target,
    condition: 'spentUnderBudget',
  },
  {
    id: 'ach_3',
    title: 'Poupador',
    description: 'Você conseguiu economizar mais de R$ 500 em um único mês. Continue assim!',
    icon: TrendingUp,
    condition: 'savedMoreThan500',
  },
  {
    id: 'ach_4',
    title: 'Constância é a Chave',
    description: 'Você se manteve dentro do orçamento por 3 meses consecutivos. Hábito de mestre!',
    icon: Sparkles,
    condition: 'consistentSaver',
  },
];

// Mock data for already unlocked achievements
export const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [];
