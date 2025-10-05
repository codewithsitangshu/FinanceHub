"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type YearRow = {
  year: number
  age: number
  portfolio: number
  annualExpense: number
  fireTarget: number
  sipMonthly: number
}

type Result = {
  yearly: YearRow[]
  fireReached: boolean
  fireMonthIndex: number | null
  fireYear: number | null
  fireAge: number | null
}

function formatCurrency(n: number) {
  // Keep locale-agnostic formatting using Intl with no currency code (units unspecified)
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(n)
}

export default function FireCalculator() {
  const currentYear = new Date().getFullYear()

  // Inputs (initial defaults are reasonable placeholders)
  const [age, setAge] = useState<number>(30)
  const [monthlyExpense, setMonthlyExpense] = useState<number>(2000)
  const [inflationPct, setInflationPct] = useState<number>(5) // annual %
  const [currentInvestment, setCurrentInvestment] = useState<number>(25000)
  const [sipMonthly, setSipMonthly] = useState<number>(1000)
  const [stepUpPct, setStepUpPct] = useState<number>(10) // annual %
  const [cagrPct, setCagrPct] = useState<number>(10) // annual %
  const [horizonYears, setHorizonYears] = useState<number>(60) // simulation cap

  const result: Result = useMemo(() => {
    // Guard against invalid inputs
    const safe = (v: number, min = 0) => (Number.isFinite(v) && v >= min ? v : 0)

    const startAge = safe(age, 0)
    let expMonthly = safe(monthlyExpense, 0)
    let portfolio = safe(currentInvestment, 0)
    const baseSip = safe(sipMonthly, 0)
    const inflA = safe(inflationPct, 0) / 100
    const cagrA = safe(cagrPct, 0) / 100
    const stepA = safe(stepUpPct, 0) / 100
    const maxYears = Math.max(1, safe(horizonYears, 1))

    // Monthly rates
    const monthlyInfl = Math.pow(1 + inflA, 1 / 12) - 1
    const monthlyRet = Math.pow(1 + cagrA, 1 / 12) - 1

    // Step-up SIP recalculated each new calendar year: SIP_y = base * (1+step)^(y)
    let sip = baseSip

    const totalMonths = maxYears * 12
    const startYear = currentYear
    let fireMonthIndex: number | null = null

    const yearly: YearRow[] = []

    for (let m = 0; m < totalMonths; m++) {
      const yearsElapsed = Math.floor(m / 12)
      const inYearMonth = m % 12
      const year = startYear + yearsElapsed

      // New year → apply step-up to SIP
      if (inYearMonth === 0) {
        sip = baseSip * Math.pow(1 + stepA, yearsElapsed)
      }

      // Apply monthly contribution and returns
      portfolio = (portfolio + sip) * (1 + monthlyRet)

      // Inflate expenses monthly
      expMonthly = expMonthly * (1 + monthlyInfl)

      // Check FIRE threshold this month
      const annualExpenseNow = expMonthly * 12
      const fireTargetNow = 60 * annualExpenseNow

      if (fireMonthIndex === null && portfolio >= fireTargetNow) {
        fireMonthIndex = m
      }

      // End-of-year snapshot (after December update)
      if (inYearMonth === 11) {
        yearly.push({
          year,
          age: startAge + yearsElapsed,
          portfolio,
          annualExpense: annualExpenseNow,
          fireTarget: fireTargetNow,
          sipMonthly: sip,
        })
      }
    }

    let fireYear: number | null = null
    let fireAge: number | null = null
    if (fireMonthIndex !== null) {
      const yearsToFire = Math.floor(fireMonthIndex / 12)
      fireYear = startYear + yearsToFire
      fireAge = startAge + yearsToFire
    }

    return {
      yearly,
      fireReached: fireMonthIndex !== null,
      fireMonthIndex,
      fireYear,
      fireAge,
    }
  }, [age, monthlyExpense, inflationPct, currentInvestment, sipMonthly, stepUpPct, cagrPct, horizonYears, currentYear])

  const chartData = useMemo(
    () =>
      result.yearly.map((r) => ({
        year: r.year,
        portfolio: Math.round(r.portfolio),
        fireTarget: Math.round(r.fireTarget),
      })),
    [result.yearly],
  )

  const summaryText = result.fireReached
    ? `FIRE reached in ${result.fireYear} at age ${result.fireAge}.`
    : `FIRE not reached within ${horizonYears} years.`

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* Inputs */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-pretty">Inputs</CardTitle>
          <CardDescription>Adjust your assumptions and recalculate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Current Age" value={age} onChange={setAge} min={0} step={1} />
          <Field label="Monthly Expenses" value={monthlyExpense} onChange={setMonthlyExpense} min={0} step={100} />
          <Field label="Inflation % (annual)" value={inflationPct} onChange={setInflationPct} min={0} step={0.5} />
          <Field
            label="Current Investment Amount"
            value={currentInvestment}
            onChange={setCurrentInvestment}
            min={0}
            step={1000}
          />
          <Field label="SIP Amount per Month" value={sipMonthly} onChange={setSipMonthly} min={0} step={100} />
          <Field label="Step-up % (annual)" value={stepUpPct} onChange={setStepUpPct} min={0} step={1} />
          <Field label="CAGR % (annual)" value={cagrPct} onChange={setCagrPct} min={0} step={0.5} />
          <Field label="Horizon (years)" value={horizonYears} onChange={setHorizonYears} min={1} step={1} />
          <div className="pt-2">
            <Button type="button" className="w-full">
              Recalculate
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{summaryText}</p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-pretty">Portfolio vs FIRE Target</CardTitle>
          <CardDescription>Year-end values (Portfolio and 60× annual expenses)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="var(--color-chart-1)"
                  name="Portfolio"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="fireTarget"
                  stroke="var(--color-chart-2)"
                  name="FIRE Target"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-pretty">Yearly Summary</CardTitle>
          <CardDescription>End-of-year values derived from monthly simulation.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <Th>Year</Th>
                <Th>Age</Th>
                <Th className="text-right">Portfolio</Th>
                <Th className="text-right">Annual Expense</Th>
                <Th className="text-right">FIRE Target (60×)</Th>
                <Th className="text-right">SIP / mo</Th>
              </tr>
            </thead>
            <tbody>
              {result.yearly.map((row) => {
                const isFireYear = result.fireReached && row.year === result.fireYear
                return (
                  <tr
                    key={row.year}
                    className={cn("border-b last:border-b-0", isFireYear && "bg-accent/40")}
                    aria-label={isFireYear ? "FIRE reached this year" : undefined}
                  >
                    <Td>{row.year}</Td>
                    <Td>{row.age}</Td>
                    <Td className="text-right">{formatCurrency(row.portfolio)}</Td>
                    <Td className="text-right">{formatCurrency(row.annualExpense)}</Td>
                    <Td className="text-right">{formatCurrency(row.fireTarget)}</Td>
                    <Td className="text-right">{formatCurrency(row.sipMonthly)}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  step?: number
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm">{label}</Label>
      <Input
        inputMode="decimal"
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
        aria-label={label}
      />
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("py-2 text-left text-muted-foreground", className)}>{children}</th>
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-2", className)}>{children}</td>
}
