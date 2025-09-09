'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering user questions about their financial data.
 *
 * - answerUserQuery - A function that takes a user's natural language query and financial context, and returns a natural language answer.
 * - AnswerUserQueryInput - The input type for the answerUserQuery function.
 * - AnswerUserQueryOutput - The return type for the answerUserQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQueryInputSchema = z.object({
  query: z.string().describe('The user\'s question in natural language.'),
  context: z.object({
    transactions: z.array(z.object({
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        category: z.string().optional(),
    })).describe('List of user transactions.'),
    categories: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })).describe('List of available categories.'),
    goals: z.array(z.object({
        title: z.string(),
        targetAmount: z.number(),
        savedAmount: z.number(),
        deadline: z.string(),
    })).describe('List of user financial goals.'),
    currentDate: z.string().describe('The current date in YYYY-MM-DD format.'),
  }),
});
export type AnswerUserQueryInput = z.infer<typeof AnswerUserQueryInputSchema>;

const AnswerUserQueryOutputSchema = z.object({
  answer: z
    .string()
    .describe('A concise and friendly answer to the user\'s question, in Portuguese (Brazil).'),
});
export type AnswerUserQueryOutput = z.infer<typeof AnswerUserQueryOutputSchema>;


export async function answerUserQuery(
  input: AnswerUserQueryInput
): Promise<AnswerUserQueryOutput> {
  return answerUserQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerUserQueryPrompt',
  input: {schema: AnswerUserQueryInputSchema},
  output: {schema: AnswerUserQueryOutputSchema},
  prompt: `You are FinSight, a friendly and helpful personal finance AI assistant. Your goal is to answer user questions based on the financial context they provide. Always answer in Portuguese (Brazil).

Current Date: {{{context.currentDate}}}

User's Query: "{{{query}}}"

Here is the user's financial data:

**Transactions:**
{{#if context.transactions.length}}
| Date | Description | Amount | Category |
|---|---|---|---|
{{#each context.transactions}}
| {{date}} | {{description}} | {{amount}} | {{#if category}}{{category}}{{else}}N/A{{/if}} |
{{/each}}
{{else}}
No transactions available.
{{/if}}

**Categories:**
{{#if context.categories.length}}
{{#each context.categories}}
- {{name}} (ID: {{id}})
{{/each}}
{{else}}
No categories defined.
{{/if}}

**Financial Goals:**
{{#if context.goals.length}}
| Title | Target | Saved | Deadline |
|---|---|---|---|
{{#each context.goals}}
| {{title}} | {{targetAmount}} | {{savedAmount}} | {{deadline}} |
{{/each}}
{{else}}
No goals set.
{{/if}}

Based *only* on the data provided, answer the user's query.
- Be concise and straight to the point.
- When asked about spending, only consider negative amounts (expenses).
- When asked about income, only consider positive amounts.
- If the answer requires a calculation, perform the calculation.
- If you need to mention a category, use its name.
- If you can't answer the question with the given data, say "Não encontrei informações suficientes para responder a sua pergunta.".
- Do not make up information.
`,
});

const answerUserQueryFlow = ai.defineFlow(
  {
    name: 'answerUserQueryFlow',
    inputSchema: AnswerUserQueryInputSchema,
    outputSchema: AnswerUserQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
