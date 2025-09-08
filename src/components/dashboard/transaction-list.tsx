'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Pencil } from 'lucide-react';
import type { Transaction, Category } from '@/lib/types';
import { SmartCategoryDialog } from './smart-category-dialog';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransactionCategory: (transactionId: string, categoryId: string) => void;
}

export function TransactionList({
  transactions,
  categories,
  onUpdateTransactionCategory,
}: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getCategoryFromId = (id: string) => categories.find((c) => c.id === id);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Visualize e categorize suas transações recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const category = transaction.category ? getCategoryFromId(transaction.category) : null;
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.amount < 0 ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {transaction.amount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => onUpdateTransactionCategory(transaction.id, value)} value={category?.id}>
                            <SelectTrigger>
                              {category ? (
                                <div className="flex items-center gap-2">
                                  <category.icon className="h-4 w-4" style={{ color: category.color }} />
                                  <SelectValue placeholder="Selecione a categoria" />
                                </div>
                              ) : (
                                <SelectValue placeholder="Selecione a categoria" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          {!category && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Sparkles className="h-4 w-4 text-accent" />
                              <span className="sr-only">Sugerir Categoria</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedTransaction && (
        <SmartCategoryDialog
          transaction={selectedTransaction}
          categories={categories}
          open={!!selectedTransaction}
          onOpenChange={() => setSelectedTransaction(null)}
          onCategorize={onUpdateTransactionCategory}
        />
      )}
    </>
  );
}
