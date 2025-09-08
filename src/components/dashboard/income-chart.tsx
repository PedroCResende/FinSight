"use client"

import * as React from "react"
import { PiggyBank } from "lucide-react"

import type { Transaction } from "@/lib/types"

interface IncomeChartProps {
  transactions: Transaction[]
}

export function IncomeChart({ transactions }: IncomeChartProps) {
  const totalIncome = React.useMemo(() => {
    return transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((acc, transaction) => acc + transaction.amount, 0)
  }, [transactions])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <div className="flex h-[250px] w-full flex-col items-center justify-center gap-4">
      <PiggyBank className="h-24 w-24 text-primary" />
      <div className="text-center">
        <p className="text-4xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        <p className="text-sm text-muted-foreground">Total de Entradas</p>
      </div>
    </div>
  )
}
