"use client"

import * as React from "react"
import { PiggyBank } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { CardDescription } from "../ui/card"

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
  
  if (totalIncome === 0) {
    return (
       <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2 text-center">
        <CardDescription>Nenhum dado de receita para exibir.</CardDescription>
        <p className="text-sm text-muted-foreground">Tente ajustar o período ou os filtros.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[250px] w-full flex-col items-center justify-center gap-4">
      <PiggyBank className="h-32 w-32 text-primary" />
      <div className="text-center">
        <p className="text-4xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
        <p className="text-sm text-muted-foreground">Total de Entradas</p>
      </div>
    </div>
  )
}
