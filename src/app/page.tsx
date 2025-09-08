'use client';

import { useState } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { Header } from '@/components/dashboard/header';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { CategoryManager } from '@/components/dashboard/category-manager';
import { TransactionUploader } from '@/components/dashboard/transaction-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_CATEGORIES, MOCK_TRANSACTIONS } from '@/lib/mock-data';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  const handleSetTransactions = (newTransactions: Transaction[]) => {
    const newTxsWithIds = newTransactions.map((tx, index) => ({
      ...tx,
      id: `tx_${Date.now()}_${index}`,
    }));
    setTransactions((prev) => [...prev, ...newTxsWithIds]);
  };

  const updateTransactionCategory = (transactionId: string, categoryId: string) => {
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId ? { ...t, category: categoryId } : t
      )
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
           <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Your spending distribution across categories.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
               <SpendingChart transactions={transactions} categories={categories} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <div className="space-y-4">
              <TransactionUploader onUpload={handleSetTransactions} />
              <TransactionList
                transactions={transactions}
                categories={categories}
                onUpdateTransactionCategory={updateTransactionCategory}
              />
            </div>
          </TabsContent>
          <TabsContent value="categories">
            <CategoryManager categories={categories} setCategories={setCategories} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
