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
import { Input } from '@/components/ui/input';
import { Sparkles, Search, Download } from 'lucide-react';
import type { Transaction, Category } from '@/lib/types';
import { SmartCategoryDialog } from './smart-category-dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransactionCategory: (transactionId: string, categoryId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (categoryId: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function TransactionList({
  transactions,
  categories,
  onUpdateTransactionCategory,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
}: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getCategoryFromId = (id: string) => categories.find((c) => c.id === id);

  const formatDate = (dateString: string) => {
    try {
      // Handles both yyyy-mm-dd and yyyy/mm/dd
      const sanitizedDateString = dateString.replace(/-/g, '/');
      const date = new Date(sanitizedDateString);
      // Adjust for timezone to prevent off-by-one day errors
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
  
  const handleExportCSV = () => {
    const getCategoryName = (categoryId?: string) => {
      if (!categoryId) return 'N/A';
      return getCategoryFromId(categoryId)?.name || 'Desconhecida';
    };

    const headers = ['Data', 'Descrição', 'Valor', 'Categoria'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        formatDate(t.date),
        `"${t.description.replace(/"/g, '""')}"`, // Handle quotes in description
        t.amount,
        getCategoryName(t.category),
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transacoes.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Visualize e categorize suas transações recentes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por descrição..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                <SelectItem value="uncategorized">Sem Categoria</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker 
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full sm:w-auto"
            />
            <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

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
                            transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => onUpdateTransactionCategory(transaction.id, value)}
                            value={category?.id}
                            disabled={transaction.amount > 0}
                          >
                             <SelectTrigger
                              className={!category ? 'text-muted-foreground' : ''}
                              style={{
                                borderColor: category?.color,
                                borderWidth: category ? '1px' : '',
                              }}
                            >
                               <SelectValue>
                                {category ? (
                                    <div className="flex items-center gap-2">
                                      {category.icon && <category.icon className="h-4 w-4" style={{ color: category.color }} />}
                                      {category.name}
                                    </div>
                                  ) : (
                                    'Selecione a categoria'
                                  )}
                               </SelectValue>
                             </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    {cat.icon && <cat.icon className="h-4 w-4" style={{ color: cat.color }} />}
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          {!category && transaction.amount < 0 && (
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
