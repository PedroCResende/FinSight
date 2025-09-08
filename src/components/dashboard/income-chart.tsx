"use client"

import * as React from "react"

import type { Transaction } from "@/lib/types"

interface IncomeChartProps {
  transactions: Transaction[]
}

function PiggyBankIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 17c0 .5-.5 1-1 1H5c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1h2.5c1 0 1.5.5 1.5 1v1Z" />
      <path d="M5.5 13.5V11a2.5 2.5 0 0 1 5 0v2.5" />
      <path d="M18 10c0-1-1-2-2-2h-1a2 2 0 0 0-2 2v2c0 1 1 2 2 2h1a2 2 0 0 0 2-2v-2Z" />
      <path d="m4.4 13.6-.3-.5" />
      <path d="m19.8 11.7-.5-.9" />
      <path d="M12 20a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1 1 1 0 0 0-1 1v1a1 1 0 0 0 1 1Z" />
      <path d="M12 12V6" />
      <path d="M10 4h4" />
      <path d="M16.5 6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1" />
      <path d="M7.5 6.5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1" />
    </svg>
  )
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
      <PiggyBankIcon className="h-24 w-24 text-primary" />
      <div className="text-center">
        <p className="text-4xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        <p className="text-sm text-muted-foreground">Total de Entradas</p>
      </div>
    </div>
  )
}
