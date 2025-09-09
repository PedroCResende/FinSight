"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

import type { Transaction, Category } from "@/lib/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CardDescription } from "../ui/card";

interface SpendingChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export function SpendingChart({ transactions, categories }: SpendingChartProps) {
  const chartData = React.useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      // Apenas transações de saída (amount < 0) e com categoria
      if (transaction.category && transaction.amount < 0) {
        const categoryId = transaction.category
        acc[categoryId] = (acc[categoryId] || 0) + Math.abs(transaction.amount)
      }
      return acc
    }, {} as { [key: string]: number })

    return Object.keys(categoryTotals).map((categoryId) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        category: category?.name || "Desconhecida",
        amount: categoryTotals[categoryId],
        fill: category?.color || 'hsl(var(--muted-foreground))',
        icon: category?.icon,
      }
    })
  }, [transactions, categories])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((data) => {
      config[data.category] = {
        label: data.category,
        color: data.fill,
        icon: data.icon
      }
    })
    return config
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2 text-center">
        <CardDescription>Nenhum dado de despesa para exibir.</CardDescription>
        <p className="text-sm text-muted-foreground">Tente ajustar o período ou os filtros.</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" formatter={(value, name, props) => {
              const formattedValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              return (
                <div className="flex flex-col">
                  <span className="font-medium">{props.payload.category}</span>
                  <span className="text-foreground">{formattedValue}</span>
                </div>
              )
            }} />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius={60}
            strokeWidth={5}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
