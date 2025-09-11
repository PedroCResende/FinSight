'use client';

import { useState, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Upload, Sparkles } from 'lucide-react';
import { parseBankStatementCsv } from '@/ai/flows/smart-csv-parser-flow';

interface TransactionUploaderProps {
  onUpload: (transactions: Omit<Transaction, 'id' | 'category'>[]) => void;
}

export function TransactionUploader({ onUpload }: TransactionUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo CSV para enviar.',
      });
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const result = await parseBankStatementCsv(content);
        
        if (!result.transactions || result.transactions.length === 0) {
            throw new Error("A IA não conseguiu encontrar nenhuma transação no arquivo. Verifique se o arquivo é um extrato CSV válido.");
        }

        onUpload(result.transactions);
        
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Falha no upload',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido durante a análise do arquivo pela IA.',
        });
      } finally {
        setIsParsing(false);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.onerror = () => {
        setIsParsing(false);
        toast({
            variant: 'destructive',
            title: 'Erro de Leitura',
            description: 'Não foi possível ler o arquivo selecionado.',
        });
    }
    reader.readAsText(file, 'latin1'); // Use 'latin1' to handle special characters
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
          <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={isParsing} />
          <Button onClick={handleUpload} disabled={!file || isParsing}>
            <Upload className="mr-2 h-4 w-4" />
            {isParsing ? 'Analisando...' : 'Enviar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
