'use client';

import { useState, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { parseBankStatementCsv } from '@/ai/flows/smart-csv-parser-flow.ts';
import { format, parse } from 'date-fns';

interface TransactionUploaderProps {
  onUpload: (transactions: (Omit<Transaction, 'id' | 'category'> & { hash: string })[]) => void;
}

export function TransactionUploader({ onUpload }: TransactionUploaderProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key to reset the file input
  const { toast } = useToast();

  const sanitizeAndFormatDate = (dateString: string): string => {
    // Attempt to parse common date formats
    try {
        // Handle DD/MM/YYYY, DD-MM-YYYY, etc.
        if (dateString.match(/^\d{2}[-\/]\d{2}[-\/]\d{4}$/)) {
            return format(parse(dateString, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');
        }
        // Handle YYYY-MM-DD, YYYY/MM/DD which is already valid but good to normalize
        if (dateString.match(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/)) {
             return format(new Date(dateString.replace(/\//g, '-')), 'yyyy-MM-dd');
        }
        // Add more formats as needed
        
        // If no format matches, return as is and hope for the best
        console.warn(`Unrecognized date format: ${dateString}. Passing it through.`);
        return dateString;
    } catch(error) {
        console.error(`Failed to parse date: ${dateString}`, error);
        // Return original string if parsing fails
        return dateString;
    }
  };


  const handleFileChangeAndUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const result = await parseBankStatementCsv(content);
        
        if (!result.transactions || result.transactions.length === 0) {
            throw new Error("A IA não conseguiu encontrar nenhuma transação no arquivo. Verifique se o arquivo é um extrato CSV válido.");
        }

        const sanitizedTransactions = result.transactions.map(tx => ({
            ...tx,
            date: sanitizeAndFormatDate(tx.date)
        }));

        // Generate a simple hash for deduplication
        const transactionsWithHashes = sanitizedTransactions.map(tx => {
            const hash = `${tx.date}-${tx.description.trim()}-${tx.amount}`;
            return { ...tx, hash };
        });

        onUpload(transactionsWithHashes);
        
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Falha no upload',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido durante a análise do arquivo pela IA.',
        });
      } finally {
        setIsParsing(false);
        // Reset the file input by changing its key
        setFileInputKey(Date.now());
      }
    };
    reader.onerror = () => {
        setIsParsing(false);
        setFileInputKey(Date.now());
        toast({
            variant: 'destructive',
            title: 'Erro de Leitura',
            description: 'Não foi possível ler o arquivo selecionado.',
        });
    }
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Importação Inteligente de Extratos
        </CardTitle>
        <CardDescription>Envie um arquivo CSV de qualquer banco. Nossa IA irá analisar e importar suas transações automaticamente.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
           <Button asChild variant="outline" className="w-full justify-start text-muted-foreground">
             <label htmlFor="csv-upload" className="cursor-pointer">
                {isParsing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Analisando...</span>
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>{isParsing ? 'Analisando...' : 'Selecione o extrato CSV...'}</span>
                    </>
                )}
             </label>
           </Button>
           <Input 
                id="csv-upload"
                key={fileInputKey}
                type="file"
                accept=".csv"
                onChange={handleFileChangeAndUpload}
                disabled={isParsing}
                className="hidden"
            />
        </div>
      </CardContent>
    </Card>
  );
}
