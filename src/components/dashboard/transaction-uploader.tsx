'use client';

import { useState, type ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Upload } from 'lucide-react';

interface TransactionUploaderProps {
  onUpload: (transactions: Transaction[]) => void;
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
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const lines = content.split('\n');
        // Assume header: 'Date', 'Description', 'Value'
        const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dateIndex = header.indexOf('Date');
        const descriptionIndex = header.indexOf('Description');
        const valueIndex = header.indexOf('Value');
        
        if (dateIndex === -1 || descriptionIndex === -1 || valueIndex === -1) {
            throw new Error("Invalid CSV format. Required columns: 'Date', 'Description', 'Value'");
        }

        const transactions: Omit<Transaction, 'id' | 'category'>[] = lines
          .slice(1)
          .filter(line => line.trim() !== '')
          .map((line) => {
            const values = line.split(',');
            return {
              date: values[dateIndex].trim(),
              description: values[descriptionIndex].trim().replace(/"/g, ''),
              amount: parseFloat(values[valueIndex]),
            };
          });
        
        onUpload(transactions as Transaction[]);
        toast({
          title: 'Upload successful',
          description: `${transactions.length} transactions have been imported.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred during parsing.',
        });
      } finally {
        setIsParsing(false);
        setFile(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Transactions</CardTitle>
        <CardDescription>Upload a CSV file with your bank transactions. Columns should be: Date, Description, Value.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
          <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={isParsing} />
          <Button onClick={handleUpload} disabled={!file || isParsing}>
            <Upload className="mr-2 h-4 w-4" />
            {isParsing ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
