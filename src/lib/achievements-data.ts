import type { Achievement, UserAchievement } from './types';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Sparkles,
  Tags,
  ShieldCheck,
  FileCheck2,
  CalendarCheck,
  Flame,
  Scissors,
  MapPin,
  Leaf,
  Magnet,
  BrainCircuit,
  PiggyBank,
  CalendarHeart,
  Crown,
  Coffee,
} from 'lucide-react';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Categoria: Organização e Engajamento
  {
    id: 'ach_1',
    title: 'Primeira Conquista',
    description: 'Você categorizou sua primeira transação. O primeiro passo para a organização!',
    icon: Award,
    condition: 'firstCategorization',
  },
  {
    id: 'ach_5',
    title: 'Dando Nome aos Bois',
    description: 'Você criou sua primeira categoria personalizada. Agora o controle é todo seu!',
    icon: Tags,
    condition: 'firstCategoryCreated',
  },
   {
    id: 'ach_8',
    title: 'Planejador',
    description: 'Você definiu seu primeiro orçamento mensal. O planejamento é a chave do sucesso.',
    icon: CalendarCheck,
    condition: 'firstBudgetCreated',
  },
  {
    id: 'ach_6',
    title: 'Mestre da Organização',
    description: 'Uau! Você já categorizou mais de 100 transações. Sua vida financeira nunca esteve tão organizada.',
    icon: ShieldCheck,
    condition: 'categorized100Transactions',
  },
  {
    id: 'ach_7',
    title: 'Tudo em Seu Lugar',
    description: 'Missão cumprida! Você categorizou todas as transações de um extrato completo.',
    icon: FileCheck2,
    condition: 'categorizedFullStatement',
  },

  // Categoria: Controle de Gastos e Orçamento
  {
    id: 'ach_2',
    title: 'Economista Iniciante',
    description: 'Você ficou dentro do orçamento em todas as categorias este mês. Ótimo controle!',
    icon: Target,
    condition: 'spentUnderBudget',
  },
  {
    id: 'ach_9',
    title: 'Mestre do Orçamento',
    description: 'Você não apenas ficou dentro do orçamento, como também gastou 20% a menos do que o planejado.',
    icon: Flame,
    condition: 'spent20PercentUnderBudget',
  },
  {
    id: 'ach_10',
    title: 'Operação Corta-Gasto',
    description: 'Você conseguiu reduzir em 15% os gastos em uma categoria em relação ao mês anterior.',
    icon: Scissors,
    condition: 'reducedCategorySpendingBy15Percent',
  },
  {
    id: 'ach_11',
    title: 'Onde o Dinheiro Mora?',
    description: 'Você analisou seus gastos e identificou sua maior fonte de despesas do mês. Conhecimento é poder!',
    icon: MapPin,
    condition: 'viewedTopSpendingCategory',
  },
  {
    id: 'ach_12',
    title: 'Mês Zen',
    description: 'Você passou um mês inteiro sem gastar em uma categoria de "supérfluos". Mente sã, bolso são!',
    icon: Leaf,
    condition: 'noSpendingInSuperfluousCategory',
  },

  // Categoria: Poupança e Metas
  {
    id: 'ach_3',
    title: 'Poupador',
    description: 'Você conseguiu economizar mais de R$ 500 em um único mês. Continue assim!',
    icon: TrendingUp,
    condition: 'savedMoreThan500',
  },
  {
    id: 'ach_13_bronze',
    title: 'Ímã de Dinheiro (Bronze)',
    description: 'Você economizou R$ 100 em um mês!',
    icon: Magnet,
    condition: 'saved100InMonth',
  },
  {
    id: 'ach_13_silver',
    title: 'Ímã de Dinheiro (Prata)',
    description: 'Você economizou R$ 500 em um mês!',
    icon: Magnet,
    condition: 'saved500InMonth',
  },
  {
    id: 'ach_13_gold',
    title: 'Ímã de Dinheiro (Ouro)',
    description: 'Você economizou R$ 1.000 em um mês!',
    icon: Magnet,
    condition: 'saved1000InMonth',
  },
  {
    id: 'ach_14',
    title: 'Estrategista Financeiro',
    description: 'Você conseguiu economizar mais de 20% da sua renda este mês. Um verdadeiro estrategista!',
    icon: BrainCircuit,
    condition: 'saved20PercentOfIncome',
  },
  {
    id: 'ach_15',
    title: 'Dia do Cofre Cheio',
    description: 'Você passou 24 horas sem registrar nenhum gasto. Pequenas vitórias levam a grandes resultados!',
    icon: PiggyBank,
    condition: 'noSpendingFor24Hours',
  },

  // Categoria: Consistência e Hábitos (Longo Prazo)
  {
    id: 'ach_4',
    title: 'Constância é a Chave',
    description: 'Você se manteve dentro do orçamento por 3 meses consecutivos. Hábito de mestre!',
    icon: Sparkles,
    condition: 'consistentSaver',
  },
  {
    id: 'ach_16',
    title: 'Aniversário Financeiro',
    description: 'Parabéns! Você está há 1 ano organizando suas finanças conosco.',
    icon: CalendarHeart,
    condition: 'oneYearAnniversary',
  },
  {
    id: 'ach_17',
    title: 'Lenda Financeira',
    description: 'Você se manteve dentro do orçamento por 12 meses consecutivos. Você domina suas finanças!',
    icon: Crown,
    condition: 'legendarySaver',
  },
  {
    id: 'ach_18',
    title: 'Sextou!',
    description: 'Você categorizou sua renda em uma sexta-feira. Começando o fim de semana com o pé direito!',
    icon: Coffee,
    condition: 'categorizedIncomeOnFriday',
  },
];

// Mock data for already unlocked achievements
export const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [];
