'use client';

import { useState, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Upload, Sparkles, Loader2, Banknote } from 'lucide-react';
import { parseBankStatementCsv } from '@/ai/flows/smart-csv-parser-flow.ts';
import { format, parse } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionUploaderProps {
  onUpload: (transactions: (Omit<Transaction, 'id' | 'category'> & { hash: string })[]) => void;
}

const SUPPORTED_BANKS = ["Nubank", "Itaú", "Bradesco", "Banco do Brasil", "Santander", "Caixa", "Inter", "C6 Bank", "Outro"];

export function TransactionUploader({ onUpload }: TransactionUploaderProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
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
        const result = await parseBankStatementCsv({
            csvContent: content,
            bank: selectedBank,
        });
        
        if (!result.transactions || result.transactions.length === 0) {
            toast({
                title: 'Nenhuma transação encontrada',
                description: 'A IA não encontrou transações no arquivo. Verifique se o banco e o arquivo estão corretos.',
            });
            return;
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
        <CardDescription>Selecione seu banco e envie um arquivo CSV. Nossa IA irá analisar e importar suas transações automaticamente.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row w-full items-center space-y-2 sm:space-y-0 sm:space-x-2">
           <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="1. Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        {bank}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

           <Button asChild variant="outline" className="w-full flex-1 justify-start text-muted-foreground" disabled={!selectedBank || isParsing}>
             <label htmlFor="csv-upload" className="cursor-pointer">
                {isParsing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Analisando...</span>
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>{isParsing ? 'Analisando...' : '2. Selecione o extrato CSV...'}</span>
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
                disabled={!selectedBank || isParsing}
                className="hidden"
            />
        </div>
      </CardContent>
    </Card>
  );
}
