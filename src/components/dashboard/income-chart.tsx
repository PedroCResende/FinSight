"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

import type { Transaction } from "@/lib/types"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface IncomeChartProps {
  transactions: Transaction[]
}

const INCOME_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function IncomeChart({ transactions }: IncomeChartProps) {
  const chartData = React.useMemo(() => {
    return transactions
      .filter(transaction => transaction.amount > 0)
      .map((transaction, index) => ({
        source: transaction.description,
        amount: transaction.amount,
        fill: INCOME_COLORS[index % INCOME_COLORS.length],
      }));
  }, [transactions])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    chartData.forEach((data) => {
      config[data.source] = {
        label: data.source,
        color: data.fill,
      }
    })
    return config
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
        Nenhum dado de entrada disponível.
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
                  <span>{props.payload.source}</span>
                  <span className="font-bold">{formattedValue}</span>
                </div>
              )
            }} />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="source"
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
