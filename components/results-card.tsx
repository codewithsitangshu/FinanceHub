"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, DollarSign, PiggyBank } from "lucide-react"
import type { ExpenseData } from "./expense-calculator"

interface ResultsCardProps {
  expenseData: ExpenseData
  yearsToRetirement: number
  fireMultiplier: number
}

export default function ResultsCard({ expenseData, yearsToRetirement, fireMultiplier }: ResultsCardProps) {
  const calculateInflatedAmount = (amount: number, inflationRate: number, years: number) => {
    return amount * Math.pow(1 + inflationRate / 100, years)
  }

  const calculatePeriodTotal = (categories: any[], multiplier: number, bufferPercentage: number) => {
    let currentTotal = 0
    let futureTotal = 0

    categories.forEach((category) => {
      category.subCategories.forEach((sub: any) => {
        const annualAmount = sub.amount * multiplier
        currentTotal += annualAmount
        futureTotal += calculateInflatedAmount(annualAmount, sub.inflationRate, yearsToRetirement)
      })
    })

    const currentBuffer = (currentTotal * bufferPercentage) / 100
    const futureBuffer = (futureTotal * bufferPercentage) / 100

    return {
      currentTotal: currentTotal + currentBuffer,
      futureTotal: futureTotal + futureBuffer,
    }
  }

  const monthly = calculatePeriodTotal(expenseData.monthly, 12, expenseData.monthlyBuffer)
  const quarterly = calculatePeriodTotal(expenseData.quarterly, 4, expenseData.quarterlyBuffer)
  const halfYearly = calculatePeriodTotal(expenseData.halfYearly, 2, expenseData.halfYearlyBuffer)
  const annual = calculatePeriodTotal(expenseData.annual, 1, expenseData.annualBuffer)

  const totalCurrentAnnual =
    monthly.currentTotal + quarterly.currentTotal + halfYearly.currentTotal + annual.currentTotal

  const totalFutureAnnual = monthly.futureTotal + quarterly.futureTotal + halfYearly.futureTotal + annual.futureTotal

  const fireNumber = totalFutureAnnual * fireMultiplier

  const inflationImpact = ((totalFutureAnnual - totalCurrentAnnual) / totalCurrentAnnual) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your Retirement Expense Projection</h2>
        <p className="text-muted-foreground">
          Based on {yearsToRetirement} years with individual inflation rates and emergency buffers
        </p>
      </div>

      <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <PiggyBank className="h-7 w-7 text-primary" />
            Your FIRE Number
          </CardTitle>
          <CardDescription className="text-base">
            Total corpus needed for financial independence ({fireMultiplier}x annual expenses)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">{formatCurrency(fireNumber)}</div>
          <p className="text-sm text-muted-foreground">
            Based on future annual expenses of {formatCurrency(totalFutureAnnual)} × {fireMultiplier} years
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Current Annual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCurrentAnnual)}</div>
            <p className="text-xs text-muted-foreground mt-1">Today's expenses (with buffer)</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Future Annual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalFutureAnnual)}</div>
            <p className="text-xs text-muted-foreground mt-1">After {yearsToRetirement} years (with buffer)</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              Inflation Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+{inflationImpact.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Total increase</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              Additional Need
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalFutureAnnual - totalCurrentAnnual)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Extra per year</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Current vs. future expenses by period (including emergency buffers)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Period</p>
                <p className="text-base font-semibold">Monthly Expenses</p>
                <p className="text-xs text-muted-foreground">+{expenseData.monthlyBuffer}% buffer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Annual</p>
                <p className="text-base font-semibold">{formatCurrency(monthly.currentTotal)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Future Annual</p>
                <p className="text-base font-semibold text-accent">{formatCurrency(monthly.futureTotal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Period</p>
                <p className="text-base font-semibold">Quarterly Expenses</p>
                <p className="text-xs text-muted-foreground">+{expenseData.quarterlyBuffer}% buffer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Annual</p>
                <p className="text-base font-semibold">{formatCurrency(quarterly.currentTotal)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Future Annual</p>
                <p className="text-base font-semibold text-accent">{formatCurrency(quarterly.futureTotal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Period</p>
                <p className="text-base font-semibold">Half-Yearly Expenses</p>
                <p className="text-xs text-muted-foreground">+{expenseData.halfYearlyBuffer}% buffer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Annual</p>
                <p className="text-base font-semibold">{formatCurrency(halfYearly.currentTotal)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Future Annual</p>
                <p className="text-base font-semibold text-accent">{formatCurrency(halfYearly.futureTotal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Period</p>
                <p className="text-base font-semibold">Annual Expenses</p>
                <p className="text-xs text-muted-foreground">+{expenseData.annualBuffer}% buffer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Annual</p>
                <p className="text-base font-semibold">{formatCurrency(annual.currentTotal)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Future Annual</p>
                <p className="text-base font-semibold text-accent">{formatCurrency(annual.futureTotal)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
