"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

import type { Transaction, Category } from "@/lib/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SpendingChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export function SpendingChart({ transactions, categories }: SpendingChartProps) {
  const chartData = React.useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      if (transaction.category && transaction.amount < 0) {
        const categoryId = transaction.category
        acc[categoryId] = (acc[categoryId] || 0) + Math.abs(transaction.amount)
      }
      return acc
    }, {} as { [key: string]: number })

    return Object.keys(categoryTotals).map((categoryId) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        category: category?.name || "Unknown",
        amount: categoryTotals[categoryId],
        fill: category?.color || 'hsl(var(--muted-foreground))',
      }
    })
  }, [transactions, categories])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((data) => {
      config[data.category] = {
        label: data.category,
        color: data.fill,
      }
    })
    return config
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
        No spending data available.
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator="dot" />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius={60}
            strokeWidth={5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
