'use client';

import { useState, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Upload } from 'lucide-react';

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
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const lines = content.split('\n').filter(line => line.trim() !== '');

        // Encontrar o índice da linha do cabeçalho real
        const headerIndex = lines.findIndex(line => line.startsWith('Data Lançamento'));
        
        if (headerIndex === -1) {
            throw new Error("Cabeçalho 'Data Lançamento,Data Contábil,Título,Descrição,Entrada(R$),Saída(R$),Saldo do Dia(R$)' não encontrado. O arquivo parece não ser um extrato válido do C6 Bank.");
        }

        // Pegar apenas as linhas de dados, pulando os cabeçalhos e informações do banco
        const dataLines = lines.slice(headerIndex + 1);

        if (dataLines.length === 0) {
          throw new Error("O arquivo CSV não contém nenhuma linha de dados após o cabeçalho.");
        }

        const transactions: Omit<Transaction, 'id' | 'category'>[] = dataLines.map((line, index) => {
            const columns = line.split(',');

            if (columns.length < 7) {
                 throw new Error(`A linha ${headerIndex + index + 2} está mal formatada. Esperava 7 colunas, mas encontrei ${columns.length}.`);
            }
            
            // Colunas esperadas: Data Lançamento, Data Contábil, Título, Descrição, Entrada(R$), Saída(R$), Saldo do Dia(R$)
            const [date, _date2, title, _description, entryStr, exitStr, ..._rest] = columns;
            
            const entryValue = parseFloat(entryStr.replace(',', '.')) || 0;
            const exitValue = parseFloat(exitStr.replace(',', '.')) || 0;

            const amount = entryValue > 0 ? entryValue : -Math.abs(exitValue);
            
            if (!date || isNaN(amount) || !title) {
                 throw new Error(`Erro ao processar a linha ${headerIndex + index + 2}. Verifique se os dados de data, título e valores estão corretos.`);
            }

            // Converter DD/MM/YYYY para YYYY-MM-DD
            const dateParts = date.split('/');
            let formattedDate = date;
            if (dateParts.length === 3) {
                 const [day, month, year] = dateParts;
                 if (day.length === 2 && month.length === 2 && year.length === 4) {
                    formattedDate = `${year}-${month}-${day}`;
                 }
            }

            return {
              date: formattedDate,
              description: title,
              amount: amount,
            };
          });
        
        onUpload(transactions);
        
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Falha no upload',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido durante a análise.',
        });
      } finally {
        setIsParsing(false);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(file, 'latin1'); // Use 'latin1' para lidar com caracteres especiais comuns em extratos brasileiros
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Transações</CardTitle>
        <CardDescription>Envie um arquivo CSV de seu extrato bancário. Atualmente otimizado para o formato do C6 Bank.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
          <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={isParsing} />
          <Button onClick={handleUpload} disabled={!file || isParsing}>
            <Upload className="mr-2 h-4 w-4" />
            {isParsing ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
