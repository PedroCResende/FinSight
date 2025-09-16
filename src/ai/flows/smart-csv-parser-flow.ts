'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligently parsing bank statement CSV files.
 *
 * - parseBankStatementCsv - A function that takes the raw text content of a CSV file and returns a structured array of transactions.
 * - ParseBankStatementCsvInput - The input type for the parseBankStatementCsv function.
 * - ParseBankStatementCsvOutput - The return type for the parseBankStatementCsv function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ParseBankStatementCsvInputSchema = z.object({
  csvContent: z.string().describe('The raw string content of the CSV file.'),
  bank: z.string().describe('The name of the bank the CSV is from. e.g., "Nubank", "Itau", "Bradesco".'),
});
export type ParseBankStatementCsvInput = z.infer<typeof ParseBankStatementCsvInputSchema>;


const ParsedTransactionSchema = z.object({
    date: z.string().describe('The date of the transaction, exactly as it appears in the source file.'),
    description: z.string().describe('The most relevant description for the transaction.'),
    amount: z.number().describe('The transaction amount. Negative for expenses, positive for income.'),
});

const ParseBankStatementCsvOutputSchema = z.object({
    transactions: z.array(ParsedTransactionSchema).describe('An array of parsed transactions from the CSV.'),
});
export type ParseBankStatementCsvOutput = z.infer<typeof ParseBankStatementCsvOutputSchema>;


export async function parseBankStatementCsv(
  input: ParseBankStatementCsvInput
): Promise<ParseBankStatementCsvOutput> {
  return parseBankStatementCsvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseBankStatementCsvPrompt',
  input: { schema: ParseBankStatementCsvInputSchema },
  output: { schema: ParseBankStatementCsvOutputSchema },
  prompt: `You are an expert financial data analyst. Your task is to parse the text from a bank statement CSV file for a specific bank and convert it into a structured JSON format.

The CSV is from the bank: {{{bank}}}

Here is the raw CSV content:
{{{csvContent}}}

Follow these instructions carefully:
1.  **Identify Transactions:** Scan the file and identify the rows that represent actual financial transactions. Ignore any header rows, summary lines, or empty lines.
2.  **Extract Key Information:** For each transaction row, extract the following three fields:
    *   **Date:** Find the transaction date. Extract the date text exactly as it appears, do not reformat it. The column might be named 'Data', 'Date', etc.
    *   **Description:** Extract the most meaningful description of the transaction. This might be in a column named 'Descrição', 'Description', 'Título', 'Histórico', or similar. Choose the most informative text available.
    *   **Amount:** Determine the transaction value.
        *   If there are separate 'Entrada' (Income) and 'Saída' (Expense) columns, combine them. The amount should be **positive** for income and **negative** for expenses.
        *   If there's a single amount column, determine if it's an expense or income based on a sign (+/-) or context, and format it as a number.
        *   Ensure the final amount is a number (float), not a string. Convert comma decimal separators (e.g., "1.234,56") to dot decimal separators (e.g., 1234.56).
3.  **Format Output:** Return a JSON object containing a single key "transactions", which is an array of the transaction objects you extracted.

Do not include any transactions that are not clearly identifiable from the data. If you cannot find any transactions, return an empty "transactions" array.
`,
});

const parseBankStatementCsvFlow = ai.defineFlow(
  {
    name: 'parseBankStatementCsvFlow',
    inputSchema: ParseBankStatementCsvInputSchema,
    outputSchema: ParseBankStatementCsvOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // This can happen if the AI returns a perfectly valid but empty response,
    // or even a completely nullish one. We'll return an empty array to prevent an error downstream.
    if (!output?.transactions) {
      return { transactions: [] };
    }
    return output;
  }
);
