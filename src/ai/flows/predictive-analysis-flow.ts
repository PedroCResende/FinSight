'use server';
/**
 * @fileOverview This file defines a Genkit flow for predicting future spending patterns based on past transactions.
 *
 * - predictSpending - A function that takes transaction history and budget details to predict spending outcomes.
 * - PredictiveAnalysisInput - The input type for the predictSpending function.
 * - PredictiveAnalysisOutput - The return type for the predictSpending function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const PredictiveAnalysisInputSchema = z.object({
  transactions: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
  })).describe("The user's transaction history for a specific category within the current month."),
  budgetLimit: z.number().describe('The total budget limit for this category for the month.'),
  categoryName: z.string().describe('The name of the category being analyzed.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
  monthName: z.string().describe('The name of the current month (e.g., "Janeiro").'),
});
export type PredictiveAnalysisInput = z.infer<typeof PredictiveAnalysisInputSchema>;

const PredictiveAnalysisOutputSchema = z.object({
  isOnTrack: z.boolean().describe('Whether the user is on track to stay within budget.'),
  prediction: z.string().describe('A short sentence predicting the outcome by the end of the month (e.g., "Você provavelmente excederá seu orçamento em R$ 50.").'),
  insight: z.string().describe('A friendly and actionable insight or recommendation for the user, in Portuguese (Brazil).'),
});
export type PredictiveAnalysisOutput = z.infer<typeof PredictiveAnalysisOutputSchema>;


export async function predictSpending(
  input: PredictiveAnalysisInput
): Promise<PredictiveAnalysisOutput> {
  // Add a fallback for cases with very few transactions
  if (input.transactions.length < 2) {
    return {
      isOnTrack: true,
      prediction: "Dados insuficientes para uma previsão precisa.",
      insight: "Continue registrando suas transações para que eu possa ajudar a prever seus gastos futuros e oferecer dicas personalizadas!"
    }
  }
  return predictiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnalysisPrompt',
  input: { schema: PredictiveAnalysisInputSchema },
  output: { schema: PredictiveAnalysisOutputSchema },
  prompt: `Você é um analista financeiro especialista em análise preditiva e finanças pessoais. Sua tarefa é analisar os gastos de um usuário para uma categoria específica, comparar com o orçamento e prever o resultado no final do mês, oferecendo um conselho útil. Sempre responda em Português (Brasil).

**Contexto:**
- Categoria: {{{categoryName}}}
- Orçamento Mensal para esta Categoria: R$ {{{budgetLimit}}}
- Mês Atual: {{{monthName}}}
- Data de Hoje: {{{currentDate}}}

**Histórico de Transações do Mês (apenas despesas):**
| Data | Descrição | Valor |
|---|---|---|
{{#each transactions}}
| {{date}} | {{description}} | R$ {{amount}} |
{{/each}}

**Sua Tarefa:**
1.  **Analise o Padrão de Gastos:** Observe a frequência e o valor médio das transações.
2.  **Calcule a Projeção:** Com base no ritmo de gastos até agora ({{{currentDate}}}), projete qual será o gasto total no final do mês.
3.  **Determine o Status:** Compare a projeção com o 'budgetLimit'. O usuário está no caminho certo para estourar o orçamento ou para economizar? Defina o campo 'isOnTrack' (true se estiver dentro do orçamento, false se for exceder).
4.  **Crie a Previsão (prediction):** Escreva uma frase curta e direta que resuma a projeção.
    *   Exemplo (se for estourar): "Você provavelmente excederá seu orçamento em cerca de R$ 50."
    *   Exemplo (se estiver ok): "Você está a caminho de terminar o mês com uma folga de R$ 80 no orçamento."
5.  **Gere o Insight (insight):** Com base na análise, forneça uma recomendação amigável, curta e acionável.
    *   Se o usuário for estourar o orçamento, dê uma dica para reduzir os gastos. Ex: "Para se manter na linha, tente limitar seus próximos gastos nesta categoria a uma média de R$ 15 até o final do mês."
    *   Se o usuário estiver bem, dê um incentivo. Ex: "Ótimo trabalho! Seu controle de gastos com {{{categoryName}}} está excelente. Continue assim e você atingirá seus objetivos!"
    *   Se os dados forem poucos, mencione isso. Ex: "Seus gastos ainda estão no início do mês. Continue acompanhando para ter uma previsão mais clara."

Analise os dados fornecidos e retorne a resposta no formato JSON solicitado.`,
});

const predictiveAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveAnalysisFlow',
    inputSchema: PredictiveAnalysisInputSchema,
    outputSchema: PredictiveAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar uma análise preditiva.');
    }
    return output;
  }
);
