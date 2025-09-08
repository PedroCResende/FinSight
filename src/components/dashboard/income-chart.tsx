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
      <g>
        {/* Coin */}
        <ellipse
          cx="120"
          cy="40"
          rx="25"
          ry="10"
          fill="#FFD700"
          stroke="#FDB813"
          strokeWidth="2"
        />
        <ellipse
          cx="120"
          cy="50"
          rx="25"
          ry="10"
          fill="#FDB813"
          stroke="#FDB813"
          strokeWidth="2"
        />
        <ellipse
          cx="120"
          cy="45"
          rx="25"
          ry="20"
          fill="none"
          stroke="#FFD700"
          strokeWidth="0.5"
        />
        <path
          d="M115 45 q5 -15 10 0 q-5 15 -10 0"
          fill="#FDB813"
          stroke="#FDB813"
          strokeWidth="1"
        />
        
        {/* Pig body */}
        <path
          d="M50,150 C10,140 10,80 60,70 C100,60 150,70 180,110 C200,140 170,180 130,180 C90,185 80,160 50,150 Z"
          fill="#FFC0CB"
          stroke="#F08080"
          strokeWidth="2"
        />
        
        {/* Ears */}
        <path d="M80,70 C70,50 100,50 100,70 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M140,80 C130,60 160,60 160,80 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M145,80 C142,68 155,68 155,80 Z" fill="#F08080" />
        
        {/* Snout */}
        <ellipse cx="175" cy="130" rx="15" ry="10" fill="#F4A7B9" stroke="#E17C94" strokeWidth="1.5" />
        <circle cx="172" cy="130" r="2" fill="#C76D82" />
        <circle cx="178" cy="130" r="2" fill="#C76D82" />

        {/* Eyes */}
        <circle cx="125" cy="110" r="3" fill="#333" />
        <circle cx="155" cy="110" r="3" fill="#333" />
        
        {/* Feet */}
        <path d="M70,175 C65,190 85,190 80,175 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M70,187 C68,189 82,189 80,187 Z" fill="#4B0082" />
        
        <path d="M95,178 C90,193 110,193 105,178 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M95,190 C93,192 107,192 105,190 Z" fill="#4B0082" />
        
        <path d="M125,178 C120,193 140,193 135,178 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M125,190 C123,192 137,192 135,190 Z" fill="#4B0082" />
        
        <path d="M150,165 C145,180 165,180 160,165 Z" fill="#FFC0CB" stroke="#F08080" strokeWidth="2" />
        <path d="M150,177 C148,179 162,179 160,177 Z" fill="#4B0082" />
        
        {/* Tail */}
        <path d="M40,120 C20,100 50,90 50,110 C50,125 30,125 35,115" fill="none" stroke="#F08080" strokeWidth="2" strokeLinecap="round" />
        
        {/* Coin Slot */}
        <path d="M100 85 h 30" stroke="#E17C94" strokeWidth="3" strokeLinecap="round" />

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
