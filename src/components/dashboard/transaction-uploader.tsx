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
        const lines = content.split('\n');
        
        // Remove o cabeçalho e filtra linhas vazias
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');

        if (dataLines.length === 0) {
          throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");
        }

        const transactions: Omit<Transaction, 'id' | 'category'>[] = dataLines.map((line, index) => {
            const sanitizedLine = line.trim();
            if (!sanitizedLine) {
                // Should be filtered out, but as a safeguard
                throw new Error(`Linha vazia encontrada na posição ${index + 2}.`);
            }

            const firstCommaIndex = sanitizedLine.indexOf(',');
            const lastCommaIndex = sanitizedLine.lastIndexOf(',');

            if (firstCommaIndex === -1 || lastCommaIndex === -1 || firstCommaIndex === lastCommaIndex) {
                 throw new Error(`A linha ${index + 2} parece estar mal formatada. Verifique o número de colunas.`);
            }
            
            const date = sanitizedLine.substring(0, firstCommaIndex).trim().replace(/"/g, '');
            const description = sanitizedLine.substring(firstCommaIndex + 1, lastCommaIndex).trim().replace(/"/g, '');
            const amountStr = sanitizedLine.substring(lastCommaIndex + 1).trim().replace(/"/g, '');
            const amount = parseFloat(amountStr);


            if (!date || isNaN(amount) || !description) {
                 throw new Error(`Erro ao processar a linha ${index + 2}. Verifique se os dados de data, descrição e valor estão corretos.`);
            }

            // Convert DD/MM/YYYY to YYYY-MM-DD
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
              description: description,
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
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Transações</CardTitle>
        <CardDescription>Envie um arquivo CSV. As colunas devem estar na ordem: Data, Descrição, Valor.</CardDescription>
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
