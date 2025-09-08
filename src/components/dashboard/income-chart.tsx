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
      viewBox="0 0 200 200"
      width="128"
      height="128"
      {...props}
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Pig Body */}
        <path
          d="M60 160 C 20 150, 20 90, 70 80 C 110 70, 160 80, 185 120 C 205 150, 180 185, 140 185 C 100 190, 90 165, 60 160 Z"
          fill="#A8E0A8"
          stroke="#558B55"
          strokeWidth="5"
        />
        {/* Feet */}
        <path d="M80 183 C 75 198, 95 198, 90 183 Z" fill="#97C997" stroke="#558B55" strokeWidth="4" />
        <path d="M120 183 C 115 198, 135 198, 130 183 Z" fill="#97C997" stroke="#558B55" strokeWidth="4" />

        {/* Ears */}
        <path d="M85 82 C 75 62, 105 62, 105 82 Z" fill="#97C997" stroke="#558B55" strokeWidth="4" />
        <path d="M140 90 C 130 70, 160 70, 160 90 Z" fill="#97C997" stroke="#558B55" strokeWidth="4" />

        {/* Snout */}
        <ellipse cx="180" cy="140" rx="16" ry="13" fill="#B9EAB9" stroke="#558B55" strokeWidth="4" />
        <ellipse cx="176" cy="140" rx="3" ry="4" fill="#4A7A4A" />
        <ellipse cx="184" cy="140" rx="3" ry="4" fill="#4A7A4A" />

        {/* Eyes */}
        <circle cx="125" cy="115" r="4.5" fill="black" />
        <circle cx="155" cy="115" r="4.5" fill="black" />

        {/* Tail */}
        <path d="M50 130 C 30 110, 60 100, 60 120 C 60 135, 40 135, 45 125" fill="none" stroke="#558B55" strokeWidth="4" />

        {/* Coin Slot */}
        <path d="M100 95 h 30" stroke="#4A7A4A" strokeWidth="5" />

        {/* Dollar Sign */}
        <text
            x="125"
            y="155"
            fontFamily="Arial, sans-serif"
            fontSize="40"
            fontWeight="bold"
            fill="white"
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            textAnchor="middle"
        >
          $
        </text>
      </g>
    </svg>
  );
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
      <PiggyBankIcon />
      <div className="text-center">
        <p className="text-4xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        <p className="text-sm text-muted-foreground">Total de Entradas</p>
      </div>
    </div>
  )
}
