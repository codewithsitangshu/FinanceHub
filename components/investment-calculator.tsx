"use client"

import { useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Params = {
  initialInvestment: number // INR
  monthlySIP: number // INR
  stepUpPct: number // % per year
  expectedReturnPct: number // % per year
  sipYears: number // years of sip
  investYears: number // total years invested
  additionalLumpsums?: { amount: number; year: number }[] // added dynamic lumpsums
}

type YearPoint = {
  year: number
  principal: number
  value: number
  gains: number
}

type YearRow = {
  year: number
  contributionsThisYear: number
  startValue: number
  endValue: number
  cumulativePrincipal: number
  cumulativeGains: number
  growthThisYear: number
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(isFinite(n) ? Math.max(0, n) : 0)

function computeProjection(p: Params) {
  const investYears = Math.max(0, Math.floor(p.investYears))
  const sipYears = Math.max(0, Math.min(investYears, Math.floor(p.sipYears)))
  const totalMonths = investYears * 12
  const sipMonths = sipYears * 12

  const rMonthly = Math.pow(1 + p.expectedReturnPct / 100, 1 / 12) - 1

  let balance = Math.max(0, p.initialInvestment)
  let principal = Math.max(0, p.initialInvestment)

  // Build a month-indexed map for additional lumpsums: deposit at start of the specified year
  const lumpsumByMonth = new Map<number, number>()
  if (p.additionalLumpsums && p.additionalLumpsums.length > 0) {
    for (const ls of p.additionalLumpsums) {
      const amt = Math.max(0, Number(ls.amount || 0))
      const yr = Math.max(0, Math.floor(Number(ls.year || 0)))
      if (!isFinite(amt) || !isFinite(yr)) continue
      if (yr > investYears) continue // ignore beyond horizon
      const mIndex = yr * 12 + 1 // month number where we deposit
      lumpsumByMonth.set(mIndex, (lumpsumByMonth.get(mIndex) || 0) + amt)
    }
  }

  const yearly: YearPoint[] = []
  // Year 0 (starting point)
  yearly.push({
    year: 0,
    principal,
    value: balance,
    gains: Math.max(0, balance - principal),
  })

  for (let m = 1; m <= totalMonths; m++) {
    // Additional lumpsum at the start of this month if scheduled
    const extra = lumpsumByMonth.get(m) || 0
    if (extra > 0) {
      balance += extra
      principal += extra
    }

    // SIP deposit during SIP months (with annual step-up)
    if (m <= sipMonths) {
      const yearIndex = Math.floor((m - 1) / 12) // 0-based year in SIP phase
      const stepMultiplier = Math.pow(1 + p.stepUpPct / 100, yearIndex)
      const sipThisMonth = p.monthlySIP * stepMultiplier
      balance += sipThisMonth
      principal += sipThisMonth
    }

    // Apply monthly growth
    balance *= 1 + rMonthly

    if (m % 12 === 0) {
      const y = m / 12
      yearly.push({
        year: y,
        principal,
        value: balance,
        gains: Math.max(0, balance - principal),
      })
    }
  }

  const last = yearly[yearly.length - 1]
  return {
    yearly,
    summary: {
      totalPrincipal: principal,
      finalValue: last?.value ?? balance,
      totalGains: (last?.value ?? balance) - principal,
    },
  }
}

export default function InvestmentCalculator() {
  // Defaults based on the example:
  // Initial: 1 Cr (10,000,000), SIP: 60,000, step-up 5%, expected return 12%, SIP 10 years, invested 20 years
  const [initialInvestment, setInitialInvestment] = useState<number>(10_000_000)
  const [monthlySIP, setMonthlySIP] = useState<number>(60_000)
  const [stepUpPct, setStepUpPct] = useState<number>(5)
  const [expectedReturnPct, setExpectedReturnPct] = useState<number>(12)
  const [sipYears, setSipYears] = useState<number>(10)
  const [investYears, setInvestYears] = useState<number>(20)

  // Dynamic additional lumpsums
  const [numLumpsums, setNumLumpsums] = useState<number>(0)
  const [lumpsums, setLumpsums] = useState<{ amount: number; year: number }[]>([])

  const setCount = (n: number) => {
    const safe = Math.max(0, Math.floor(n))
    setNumLumpsums(safe)
    setLumpsums((prev) => {
      const next = prev.slice(0, safe)
      while (next.length < safe) next.push({ amount: 0, year: 1 })
      return next
    })
  }

  const updateLumpsum = (idx: number, field: "amount" | "year", value: number) => {
    setLumpsums((prev) => {
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        [field]: field === "year" ? Math.max(0, Math.floor(value)) : Math.max(0, value),
      }
      return next
    })
  }

  const { yearly, summary } = useMemo(
    () =>
      computeProjection({
        initialInvestment,
        monthlySIP,
        stepUpPct,
        expectedReturnPct,
        sipYears,
        investYears,
        additionalLumpsums: lumpsums,
      }),
    [initialInvestment, monthlySIP, stepUpPct, expectedReturnPct, sipYears, investYears, lumpsums],
  )

  // Derive year-wise rows for the detail table
  const yearRows = useMemo(() => {
    if (!yearly || yearly.length < 2) return []
    const rows = []
    for (let i = 1; i < yearly.length; i++) {
      const prev = yearly[i - 1]
      const curr = yearly[i]
      const contributionsThisYear = Math.max(0, curr.principal - prev.principal)
      const growthThisYear = curr.value - prev.value - contributionsThisYear
      rows.push({
        year: curr.year,
        contributionsThisYear,
        startValue: prev.value,
        endValue: curr.value,
        cumulativePrincipal: curr.principal,
        cumulativeGains: Math.max(0, curr.value - curr.principal),
        growthThisYear,
      })
    }
    return rows
  }, [yearly])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="initial">Initial investment (INR)</Label>
          <Input
            id="initial"
            type="number"
            min={0}
            inputMode="numeric"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value || 0))}
            placeholder="10000000"
          />
          <p className="text-xs text-muted-foreground">Example: 1 Cr = 10000000</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sip">Monthly SIP (INR)</Label>
          <Input
            id="sip"
            type="number"
            min={0}
            inputMode="numeric"
            value={monthlySIP}
            onChange={(e) => setMonthlySIP(Number(e.target.value || 0))}
            placeholder="60000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stepup">% step-up per year</Label>
          <Input
            id="stepup"
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            value={stepUpPct}
            onChange={(e) => setStepUpPct(Number(e.target.value || 0))}
            placeholder="5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="return">% expected annual return</Label>
          <Input
            id="return"
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            value={expectedReturnPct}
            onChange={(e) => setExpectedReturnPct(Number(e.target.value || 0))}
            placeholder="12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sip-years">SIP duration (years)</Label>
          <Input
            id="sip-years"
            type="number"
            min={0}
            step="1"
            inputMode="numeric"
            value={sipYears}
            onChange={(e) => setSipYears(Math.max(0, Math.floor(Number(e.target.value || 0))))}
            placeholder="10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invest-years">Total investment horizon (years)</Label>
          <Input
            id="invest-years"
            type="number"
            min={0}
            step="1"
            inputMode="numeric"
            value={investYears}
            onChange={(e) => setInvestYears(Math.max(0, Math.floor(Number(e.target.value || 0))))}
            placeholder="20"
          />
          <p className="text-xs text-muted-foreground">
            Must be ≥ SIP years. SIP contributions accumulate during SIP years and remain invested thereafter.
          </p>
        </div>
      </div>

      {/* Dynamic lumpsum controls */}
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="num-lumpsums">No. of lumpsum</Label>
            <Input
              id="num-lumpsums"
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              value={numLumpsums}
              onChange={(e) => setCount(Number(e.target.value || 0))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Set how many additional one-time lumpsum contributions you plan to make.
            </p>
          </div>
        </div>

        {numLumpsums > 0 && (
          <div className="space-y-4">
            {Array.from({ length: numLumpsums }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`ls-amt-${i}`}>Lumpsum {i + 1} amount (INR)</Label>
                  <Input
                    id={`ls-amt-${i}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={lumpsums[i]?.amount ?? 0}
                    onChange={(e) => updateLumpsum(i, "amount", Number(e.target.value || 0))}
                    placeholder="500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`ls-year-${i}`}>Year of investment</Label>
                  <Input
                    id={`ls-year-${i}`}
                    type="number"
                    min={0}
                    step="1"
                    inputMode="numeric"
                    value={lumpsums[i]?.year ?? 1}
                    onChange={(e) => updateLumpsum(i, "year", Number(e.target.value || 0))}
                    placeholder="5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deposited at the start of this year (e.g., 5 means at the start of year 5) and remains invested
                    until the end of the horizon.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Total Principal</CardTitle>
            <CardDescription>Sum of all contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatINR(summary.totalPrincipal)}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Estimated Value</CardTitle>
            <CardDescription>At end of horizon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatINR(summary.finalValue)}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Total Gains</CardTitle>
            <CardDescription>Value − Principal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatINR(summary.totalGains)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Growth over time</CardTitle>
          <CardDescription>
            Yearly view of principal vs gains with monthly compounding and annual SIP step-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[360px]"
            config={{
              principal: { label: "Principal", color: "hsl(var(--chart-2))" },
              gains: { label: "Gains", color: "hsl(var(--chart-1))" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearly} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(v)
                  }
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" valueFormatter={(v) => formatINR(Number(v))} />}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="principal"
                  name="Principal"
                  stroke="var(--color-principal)"
                  fill="var(--color-principal)"
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="gains"
                  name="Gains"
                  stroke="var(--color-gains)"
                  fill="var(--color-gains)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Year-wise breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-wise Breakdown</CardTitle>
          <CardDescription>Detailed view of yearly contributions, growth, and cumulative values.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Contributions (Year)</TableHead>
                  <TableHead>Growth (Year)</TableHead>
                  <TableHead>End Value</TableHead>
                  <TableHead>Cumulative Principal</TableHead>
                  <TableHead>Cumulative Gains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearRows.map((r) => (
                  <TableRow key={r.year}>
                    <TableCell>{r.year}</TableCell>
                    <TableCell>{formatINR(r.contributionsThisYear)}</TableCell>
                    <TableCell>{formatINR(r.growthThisYear)}</TableCell>
                    <TableCell>{formatINR(r.endValue)}</TableCell>
                    <TableCell>{formatINR(r.cumulativePrincipal)}</TableCell>
                    <TableCell>{formatINR(r.cumulativeGains)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assumptions</CardTitle>
          <CardDescription>
            Lumpsum is invested for the entire horizon. Additional lumpsums are deposited once at the start of their
            specified year and remain invested until the end of the total horizon. SIP contributions are deposited
            monthly at the start of each month, step up annually, and compound monthly. After SIP years end, the
            accumulated SIP corpus remains invested until the end of the total horizon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Change the inputs above to explore different outcomes. This is a simplified projection and not investment
            advice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
