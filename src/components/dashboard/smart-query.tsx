'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Search, Loader2 } from 'lucide-react';
import { answerUserQuery } from '@/ai/flows/smart-query-flow';
import type { Transaction, Category, Goal } from '@/lib/types';
import { format } from 'date-fns';

interface SmartQueryProps {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
}

export function SmartQuery({ transactions, categories, goals }: SmartQueryProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const suggestedQueries = [
    'Quanto gastei com Lazer este mês?',
    'Qual minha maior despesa até agora?',
    'Quanto já economizei para minha viagem?',
    'Liste minhas últimas 3 transações',
  ];

  const handleQuery = async (currentQuery: string) => {
    if (!currentQuery) return;

    setIsLoading(true);
    setAnswer('');
    setError('');

    try {
       // Map the data to the format expected by the AI flow
      const context = {
        transactions: transactions.map(t => ({
          ...t,
          category: categories.find(c => c.id === t.category)?.name,
        })),
        categories: categories.map(c => ({ id: c.id, name: c.name })),
        goals: goals.map(g => ({
          ...g,
          deadline: format(g.deadline, 'yyyy-MM-dd'),
        })),
        currentDate: format(new Date(), 'yyyy-MM-dd'),
      };

      const result = await answerUserQuery({ query: currentQuery, context });
      setAnswer(result.answer);
    } catch (e) {
      console.error(e);
      setError('Desculpe, não consegui processar sua pergunta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(query);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      setQuery(suggestion);
      handleQuery(suggestion);
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Atalhos Inteligentes</span>
        </CardTitle>
        <CardDescription>
          Faça uma pergunta em linguagem natural sobre suas finanças.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Quanto gastei em supermercado este mês?"
            className="bg-background/80"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            <span className="sr-only sm:not-sr-only sm:ml-2">Perguntar</span>
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion) => (
                <Button key={suggestion} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)} disabled={isLoading}>
                    {suggestion}
                </Button>
            ))}
        </div>

        {(isLoading || answer || error) && (
            <div className="pt-4">
                {isLoading && (
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span>Analisando seus dados...</span>
                    </div>
                )}
                {error && <p className="text-destructive font-medium">{error}</p>}
                {answer && <p className="text-foreground font-medium bg-background/50 p-3 rounded-md border">{answer}</p>}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
