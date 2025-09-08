'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting categories for uncategorized transactions based on their descriptions.
 *
 * - suggestTransactionCategory - A function that takes a transaction description and returns a suggested category.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the transaction to be categorized.'),
  availableCategories: z
    .array(z.string())
    .describe('The list of available categories for transactions.'),
});
export type SuggestTransactionCategoryInput = z.infer<
  typeof SuggestTransactionCategoryInputSchema
>;

const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The category suggested for the transaction.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the category suggestion.'),
});
export type SuggestTransactionCategoryOutput = z.infer<
  typeof SuggestTransactionCategoryOutputSchema
>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `You are a personal finance expert. Your task is to suggest a category for a given transaction based on its description and a list of available categories. You must always select a category from the given list of available categories.

Transaction Description: {{{description}}}
Available Categories: {{#each availableCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

First, reason step by step about which category is the best fit for the transaction.
Then, return the suggested category and your reasoning.

Output your answer in JSON format.
`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
