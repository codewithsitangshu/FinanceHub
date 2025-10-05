"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ResultsTable from "@/components/three-bucket-results-table"
import { Calculator } from "lucide-react"

interface CalculatorInputs {
  monthlyRequirement: number
  inflationRate: number
  b1Fund: string
  b1Duration: number
  b1Returns: number
  b2Fund: string
  b2Duration: number
  b2Returns: number
  stocksAmount: number
  dividendYield: number
  mfAmount: number
  b3Returns: number
}

interface MonthlyData {
  month: number
  requirement: number
  dividend: number
  b1Corpus: number
  b2Corpus: number
  b2Returns: number
  b2ReturnsPercent: number
  b3aCorpus: number
  b3bCorpus: number
  marketReturns: number
  marketReturnsPercent: number
}

function generateVariableReturns(expectedAnnualReturn: number, months: number): number[] {
  const returns: number[] = []
  const sevenYearsMonths = 7 * 12 // 84 months

  // Pattern: mix of negative, positive, and high returns that average to expected return
  const yearlyPattern = [
    -0.03, // Year 1: -3%
    0.18, // Year 2: 18%
    -0.05, // Year 3: -5%
    0.22, // Year 4: 22%
    0.08, // Year 5: 8%
    0.15, // Year 6: 15%
    0.12, // Year 7: 12%
  ]

  // Adjust pattern to match expected CAGR
  let product = 1
  for (const yearReturn of yearlyPattern) {
    product *= 1 + yearReturn
  }
  const patternCAGR = Math.pow(product, 1 / 7) - 1

  // Scale pattern to match expected return
  const scaleFactor = expectedAnnualReturn / 100 / patternCAGR
  const adjustedPattern = yearlyPattern.map((r) => r * scaleFactor)

  // Create realistic monthly variations within each year
  // Instead of dividing annual return by 12, create a pattern with ups and downs
  const monthlyPatterns = [
    [0.02, -0.01, 0.03, -0.02, 0.01, -0.015, 0.025, -0.01, 0.02, -0.005, 0.015, -0.01], // Volatile pattern
    [0.03, 0.04, 0.02, 0.03, 0.025, 0.02, 0.015, 0.02, 0.01, 0.015, 0.02, 0.025], // Positive pattern
    [-0.02, -0.03, -0.01, 0.01, -0.015, -0.02, 0.005, -0.01, -0.015, 0.01, -0.005, -0.01], // Negative pattern
    [0.04, 0.03, 0.05, 0.02, 0.03, 0.025, 0.02, 0.015, 0.01, 0.02, 0.015, 0.01], // Strong positive
    [0.015, 0.02, 0.01, 0.015, 0.005, 0.01, 0.02, 0.005, 0.015, 0.01, 0.005, 0.01], // Moderate positive
    [0.025, 0.03, 0.02, 0.015, 0.025, 0.01, 0.015, 0.02, 0.01, 0.015, 0.005, 0.01], // Good positive
    [0.02, 0.015, 0.025, 0.01, 0.02, 0.015, 0.01, 0.015, 0.005, 0.01, 0.015, 0.01], // Steady positive
  ]

  for (let month = 0; month < months; month++) {
    const yearInCycle = Math.floor((month / 12) % 7)
    const monthInYear = month % 12
    const targetAnnualReturn = adjustedPattern[yearInCycle]

    // Get the monthly pattern for this year
    const baseMonthlyPattern = monthlyPatterns[yearInCycle]

    // Calculate what the pattern would give us
    let patternProduct = 1
    for (const monthlyReturn of baseMonthlyPattern) {
      patternProduct *= 1 + monthlyReturn
    }
    const patternAnnualReturn = patternProduct - 1

    // Scale the monthly pattern to match target annual return
    const monthlyScaleFactor = Math.pow(1 + targetAnnualReturn, 1 / 12) / Math.pow(1 + patternAnnualReturn, 1 / 12)
    const adjustedMonthlyReturn = baseMonthlyPattern[monthInYear] * monthlyScaleFactor

    returns.push(adjustedMonthlyReturn)
  }

  return returns
}

export default function BucketCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyRequirement: 50000,
    inflationRate: 6,
    b1Fund: "liquid",
    b1Duration: 16,
    b1Returns: 6,
    b2Fund: "conservative",
    b2Duration: 24,
    b2Returns: 8,
    stocksAmount: 5000000,
    dividendYield: 2,
    mfAmount: 3000000,
    b3Returns: 12,
  })

  const [results, setResults] = useState<MonthlyData[] | null>(null)
  const [yearsLasted, setYearsLasted] = useState<number | null>(null)

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const calculateBucketStrategy = () => {
    const monthlyData: MonthlyData[] = []

    let b1Corpus = inputs.monthlyRequirement * inputs.b1Duration
    let b2Corpus = inputs.monthlyRequirement * inputs.b2Duration
    let b3aCorpus = inputs.stocksAmount
    let b3bCorpus = inputs.mfAmount
    let currentRequirement = inputs.monthlyRequirement
    let monthsSinceB1Refill = 0
    let monthsSinceB2Refill = 0

    const maxMonths = 40 * 12 // 40 years

    const b2VariableReturns = generateVariableReturns(inputs.b2Returns, maxMonths)
    const b3VariableReturns = generateVariableReturns(inputs.b3Returns, maxMonths)

    for (let month = 1; month <= maxMonths; month++) {
      const monthInYear = ((month - 1) % 12) + 1
      const isQuarterEnd = monthInYear % 3 === 0
      const monthlyDividend = isQuarterEnd ? (b3aCorpus * (inputs.dividendYield / 100)) / 4 : 0

      const b2MonthlyReturnRate = b2VariableReturns[month - 1]
      const b2MonthlyReturn = b2Corpus * b2MonthlyReturnRate
      const b2ReturnsPercent = b2MonthlyReturnRate * 100
      b2Corpus += b2MonthlyReturn

      const b3MonthlyReturnRate = b3VariableReturns[month - 1]
      const b3aMonthlyReturn = b3aCorpus * b3MonthlyReturnRate
      b3aCorpus += b3aMonthlyReturn

      const b3bMonthlyReturn = b3bCorpus * b3MonthlyReturnRate
      b3bCorpus += b3bMonthlyReturn

      const totalMarketReturns = b3aMonthlyReturn + b3bMonthlyReturn
      const totalB3Corpus = b3aCorpus + b3bCorpus
      const marketReturnsPercent =
        totalB3Corpus > 0 ? (totalMarketReturns / (totalB3Corpus - totalMarketReturns)) * 100 : 0

      // Apply returns to B1
      const b1MonthlyReturn = (b1Corpus * (inputs.b1Returns / 100)) / 12
      b1Corpus += b1MonthlyReturn

      // Withdraw from B1 for monthly requirement
      b1Corpus -= currentRequirement
      monthsSinceB1Refill++
      monthsSinceB2Refill++

      // Check if B1 needs refill
      if (monthsSinceB1Refill >= inputs.b1Duration || b1Corpus <= 0) {
        const refillAmount = currentRequirement * inputs.b1Duration
        if (b2Corpus >= refillAmount) {
          b2Corpus -= refillAmount
          b1Corpus += refillAmount
          monthsSinceB1Refill = 0
        } else {
          // B2 doesn't have enough, corpus exhausted
          monthlyData.push({
            month,
            requirement: currentRequirement,
            dividend: monthlyDividend,
            b1Corpus: Math.max(0, b1Corpus),
            b2Corpus: Math.max(0, b2Corpus),
            b2Returns: b2MonthlyReturn,
            b2ReturnsPercent: b2ReturnsPercent,
            b3aCorpus: Math.max(0, b3aCorpus),
            b3bCorpus: Math.max(0, b3bCorpus),
            marketReturns: totalMarketReturns,
            marketReturnsPercent: marketReturnsPercent,
          })
          setResults(monthlyData)
          setYearsLasted(Math.floor(month / 12))
          return
        }
      }

      // Check if B2 needs refill
      if (monthsSinceB2Refill >= inputs.b2Duration) {
        const refillAmount = currentRequirement * inputs.b2Duration
        const totalB3 = b3aCorpus + b3bCorpus

        if (totalB3 >= refillAmount) {
          const b3aWithdraw = (b3aCorpus / totalB3) * refillAmount
          const b3bWithdraw = (b3bCorpus / totalB3) * refillAmount

          b3aCorpus -= b3aWithdraw
          b3bCorpus -= b3bWithdraw
          b2Corpus += refillAmount
          monthsSinceB2Refill = 0
        }
      }

      // Store monthly data
      monthlyData.push({
        month,
        requirement: currentRequirement,
        dividend: monthlyDividend,
        b1Corpus: b1Corpus,
        b2Corpus: b2Corpus,
        b2Returns: b2MonthlyReturn,
        b2ReturnsPercent: b2ReturnsPercent,
        b3aCorpus: b3aCorpus,
        b3bCorpus: b3bCorpus,
        marketReturns: totalMarketReturns,
        marketReturnsPercent: marketReturnsPercent,
      })

      // Increase requirement annually for inflation
      if (month % 12 === 0) {
        currentRequirement = currentRequirement * (1 + inputs.inflationRate / 100)
      }

      // Check if corpus is exhausted
      if (b1Corpus <= 0 && b2Corpus <= 0 && b3aCorpus <= 0 && b3bCorpus <= 0) {
        setResults(monthlyData)
        setYearsLasted(Math.floor(month / 12))
        return
      }
    }

    // If we reach here, corpus lasted 40+ years
    setResults(monthlyData)
    setYearsLasted(null) // Infinite (40+ years)
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader className="bg-card">
          <CardTitle className="text-2xl text-foreground">Calculator Inputs</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your retirement planning parameters</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">Basic Requirements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRequirement" className="text-foreground font-medium">
                  Monthly Requirement (₹)
                </Label>
                <Input
                  id="monthlyRequirement"
                  type="number"
                  value={inputs.monthlyRequirement}
                  onChange={(e) => handleInputChange("monthlyRequirement", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">Amount needed today or on first day of retirement</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inflationRate" className="text-foreground font-medium">
                  Expected Inflation Rate (%)
                </Label>
                <Input
                  id="inflationRate"
                  type="number"
                  step="0.1"
                  value={inputs.inflationRate}
                  onChange={(e) => handleInputChange("inflationRate", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Bucket 1 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">
              Bucket 1 (B1) - Liquid Fund
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b1Fund" className="text-foreground font-medium">
                  Fund Type
                </Label>
                <Select value={inputs.b1Fund} onValueChange={(value) => handleInputChange("b1Fund", value)}>
                  <SelectTrigger className="border-2 border-primary bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liquid">Liquid Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b1Duration" className="text-foreground font-medium">
                  Bucket 1 Duration (Months)
                </Label>
                <Input
                  id="b1Duration"
                  type="number"
                  value={inputs.b1Duration}
                  onChange={(e) => handleInputChange("b1Duration", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">Months of expenses to hold in B1</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b1Returns" className="text-foreground font-medium">
                  Expected B1 Returns (%)
                </Label>
                <Input
                  id="b1Returns"
                  type="number"
                  step="0.1"
                  value={inputs.b1Returns}
                  onChange={(e) => handleInputChange("b1Returns", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Bucket 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">
              Bucket 2 (B2) - Conservative/Balanced Fund
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b2Fund" className="text-foreground font-medium">
                  Fund Type
                </Label>
                <Select value={inputs.b2Fund} onValueChange={(value) => handleInputChange("b2Fund", value)}>
                  <SelectTrigger className="border-2 border-primary bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative Hybrid Fund</SelectItem>
                    <SelectItem value="balanced">Balanced Advantage Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b2Duration" className="text-foreground font-medium">
                  Bucket 2 Duration (Months)
                </Label>
                <Input
                  id="b2Duration"
                  type="number"
                  value={inputs.b2Duration}
                  onChange={(e) => handleInputChange("b2Duration", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">Should be ≥ B1 Duration</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b2Returns" className="text-foreground font-medium">
                  Expected B2 Returns (%)
                </Label>
                <Input
                  id="b2Returns"
                  type="number"
                  step="0.1"
                  value={inputs.b2Returns}
                  onChange={(e) => handleInputChange("b2Returns", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Bucket 3A - Stocks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">
              Bucket B3A - Stocks
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stocksAmount" className="text-foreground font-medium">
                  Stock Portfolio Amount (₹)
                </Label>
                <Input
                  id="stocksAmount"
                  type="number"
                  value={inputs.stocksAmount}
                  onChange={(e) => handleInputChange("stocksAmount", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dividendYield" className="text-foreground font-medium">
                  Dividend Yield (%)
                </Label>
                <Input
                  id="dividendYield"
                  type="number"
                  step="0.1"
                  value={inputs.dividendYield}
                  onChange={(e) => handleInputChange("dividendYield", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Average dividend rate from stock portfolio (paid quarterly)
                </p>
              </div>
            </div>
          </div>

          {/* Bucket 3B - Mutual Funds */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2">
              Bucket B3B - Mutual Funds
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mfAmount" className="text-foreground font-medium">
                  Mutual Fund Amount (₹)
                </Label>
                <Input
                  id="mfAmount"
                  type="number"
                  value={inputs.mfAmount}
                  onChange={(e) => handleInputChange("mfAmount", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b3Returns" className="text-foreground font-medium">
                  B3 Return (%)
                </Label>
                <Input
                  id="b3Returns"
                  type="number"
                  step="0.1"
                  value={inputs.b3Returns}
                  onChange={(e) => handleInputChange("b3Returns", Number(e.target.value))}
                  className="border-2 border-primary bg-input text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Expected return for both B3A (stocks) and B3B (mutual funds)
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={calculateBucketStrategy}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-6 text-lg"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Strategy
          </Button>
        </CardContent>
      </Card>

      {results !== null && <ResultsTable data={results} yearsLasted={yearsLasted} />}
    </div>
  )
}
