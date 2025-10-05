"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator } from "lucide-react"
import ExpenseSection from "./expense-section"
import ResultsCard from "./results-card"

export interface SubCategory {
  id: string
  name: string
  amount: number
  inflationRate: number
}

export interface Category {
  id: string
  name: string
  subCategories: SubCategory[]
}

export interface ExpenseData {
  monthly: Category[]
  quarterly: Category[]
  halfYearly: Category[]
  annual: Category[]
  monthlyBuffer: number
  quarterlyBuffer: number
  halfYearlyBuffer: number
  annualBuffer: number
}

const initialMonthlyCategories: Category[] = [
  {
    id: "housing-home-monthly",
    name: "HOUSING & HOME",
    subCategories: [
      { id: "groceries", name: "Groceries", amount: 5000, inflationRate: 5 },
      { id: "fish", name: "Fish", amount: 2500, inflationRate: 6 },
      { id: "chicken", name: "Chicken", amount: 1500, inflationRate: 6 },
      { id: "vegitable", name: "Vegitable", amount: 5000, inflationRate: 5 },
      { id: "gas-utilities", name: "Gas (Utilities)", amount: 1000, inflationRate: 4 },
      { id: "internet-tv", name: "Internet & TV", amount: 1000, inflationRate: 3 },
    ],
  },
  {
    id: "entertainment-monthly",
    name: "ENTERTAINMENT & SUBSCRIPTIONS",
    subCategories: [
      { id: "hangout", name: "Hangout", amount: 5000, inflationRate: 5 },
      { id: "ott", name: "OTT Subscriptions", amount: 500, inflationRate: 8 },
    ],
  },
  {
    id: "personal-care-monthly",
    name: "PERSONAL CARE & LIFESTYLE",
    subCategories: [
      { id: "phone", name: "Phone", amount: 1000, inflationRate: 3 },
      { id: "clothing", name: "Clothing", amount: 3000, inflationRate: 5 },
      { id: "beautification", name: "Beautification", amount: 2000, inflationRate: 5 },
      { id: "gym", name: "Gym", amount: 1500, inflationRate: 4 },
      { id: "regular-expense", name: "Regular Expense", amount: 5000, inflationRate: 5 },
    ],
  },
  {
    id: "transportation-monthly",
    name: "TRANSPORTATION",
    subCategories: [
      { id: "car-fuel", name: "Car Fuel", amount: 3000, inflationRate: 6 },
      { id: "bike-fuel", name: "Bike Fuel", amount: 1500, inflationRate: 6 },
      {
        id: "public-transport",
        name: "Transportation (public transport, ride-sharing)",
        amount: 1000,
        inflationRate: 5,
      },
    ],
  },
  {
    id: "maintenance-monthly",
    name: "MAINTENANCE",
    subCategories: [{ id: "housing-maintenance-monthly", name: "Housing Maintenance", amount: 5000, inflationRate: 5 }],
  },
  {
    id: "medical-monthly",
    name: "MEDICAL & HEALTH",
    subCategories: [
      { id: "health-insurance", name: "Health Insurance", amount: 4000, inflationRate: 8 },
      { id: "medicine", name: "Medicine & Health Related", amount: 5000, inflationRate: 7 },
    ],
  },
  {
    id: "financial-monthly",
    name: "FINANCIAL OBLIGATIONS",
    subCategories: [{ id: "credit-card", name: "Credit Card", amount: 2000, inflationRate: 0 }],
  },
]

const initialQuarterlyCategories: Category[] = [
  {
    id: "housing-quarterly",
    name: "HOUSING & HOME",
    subCategories: [{ id: "electricity", name: "Electricity", amount: 10000, inflationRate: 5 }],
  },
  {
    id: "vacation-quarterly",
    name: "VACATION",
    subCategories: [{ id: "vacation", name: "Every Quarter Vacation", amount: 50000, inflationRate: 6 }],
  },
  {
    id: "maintenance-quarterly",
    name: "MAINTENANCE",
    subCategories: [
      { id: "housing-maintenance-quarterly", name: "Housing Maintenance", amount: 30000, inflationRate: 5 },
    ],
  },
]

const initialHalfYearlyCategories: Category[] = [
  {
    id: "transportation-half-yearly",
    name: "TRANSPORTATION",
    subCategories: [
      { id: "car-maintenance", name: "Car Maintenance", amount: 6000, inflationRate: 5 },
      { id: "bike-maintenance", name: "Bike Maintenance", amount: 1500, inflationRate: 5 },
    ],
  },
]

const initialAnnualCategories: Category[] = [
  {
    id: "transportation-annual",
    name: "TRANSPORTATION",
    subCategories: [
      { id: "car-insurance", name: "Car Insurance", amount: 6000, inflationRate: 6 },
      { id: "bike-insurance", name: "Bike Insurance", amount: 1500, inflationRate: 6 },
    ],
  },
  {
    id: "maintenance-annual",
    name: "MAINTENANCE",
    subCategories: [{ id: "housing-maintenance-annual", name: "Housing Maintenance", amount: 50000, inflationRate: 5 }],
  },
]

export default function RetirementCalculator() {
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    monthly: initialMonthlyCategories,
    quarterly: initialQuarterlyCategories,
    halfYearly: initialHalfYearlyCategories,
    annual: initialAnnualCategories,
    monthlyBuffer: 30,
    quarterlyBuffer: 30,
    halfYearlyBuffer: 50,
    annualBuffer: 50,
  })

  const [yearsToRetirement, setYearsToRetirement] = useState<number>(20)
  const [fireMultiplier, setFireMultiplier] = useState<number>(25)
  const [showResults, setShowResults] = useState(false)

  const updateExpenseData = (period: keyof ExpenseData, categories: Category[]) => {
    setExpenseData((prev) => ({
      ...prev,
      [period]: categories,
    }))
  }

  const updateBufferPercentage = (
    period: "monthlyBuffer" | "quarterlyBuffer" | "halfYearlyBuffer" | "annualBuffer",
    value: number,
  ) => {
    setExpenseData((prev) => ({
      ...prev,
      [period]: value,
    }))
  }

  const calculateResults = () => {
    setShowResults(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Retirement Timeline & FIRE Number
          </CardTitle>
          <CardDescription>Enter your retirement timeline and FIRE multiplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-end gap-4 max-w-3xl">
            <div className="flex-1">
              <Label htmlFor="years">Years to Retirement</Label>
              <Input
                id="years"
                type="number"
                min="1"
                value={yearsToRetirement}
                onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="fire-multiplier">FIRE Multiplier (Years of Expenses)</Label>
              <Input
                id="fire-multiplier"
                type="number"
                min="1"
                step="0.5"
                value={fireMultiplier}
                onChange={(e) => setFireMultiplier(Number(e.target.value))}
                className="mt-1.5"
                placeholder="e.g., 25 for 4% withdrawal"
              />
              <p className="text-xs text-muted-foreground mt-1">Common: 25x (4% rule) or 30x (3.33% rule)</p>
            </div>
            <Button onClick={calculateResults} size="lg" className="px-8">
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="monthly" className="text-sm py-3">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="text-sm py-3">
            Quarterly
          </TabsTrigger>
          <TabsTrigger value="half-yearly" className="text-sm py-3">
            Half-Yearly
          </TabsTrigger>
          <TabsTrigger value="annual" className="text-sm py-3">
            Annual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <ExpenseSection
            title="Monthly Expenses"
            description="Expenses that occur every month"
            categories={expenseData.monthly}
            bufferPercentage={expenseData.monthlyBuffer}
            onUpdate={(categories) => updateExpenseData("monthly", categories)}
            onBufferUpdate={(value) => updateBufferPercentage("monthlyBuffer", value)}
          />
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <ExpenseSection
            title="Quarterly Expenses"
            description="Expenses that occur every 3 months"
            categories={expenseData.quarterly}
            bufferPercentage={expenseData.quarterlyBuffer}
            onUpdate={(categories) => updateExpenseData("quarterly", categories)}
            onBufferUpdate={(value) => updateBufferPercentage("quarterlyBuffer", value)}
          />
        </TabsContent>

        <TabsContent value="half-yearly" className="space-y-4">
          <ExpenseSection
            title="Half-Yearly Expenses"
            description="Expenses that occur every 6 months"
            categories={expenseData.halfYearly}
            bufferPercentage={expenseData.halfYearlyBuffer}
            onUpdate={(categories) => updateExpenseData("halfYearly", categories)}
            onBufferUpdate={(value) => updateBufferPercentage("halfYearlyBuffer", value)}
          />
        </TabsContent>

        <TabsContent value="annual" className="space-y-4">
          <ExpenseSection
            title="Annual Expenses"
            description="Expenses that occur once a year"
            categories={expenseData.annual}
            bufferPercentage={expenseData.annualBuffer}
            onUpdate={(categories) => updateExpenseData("annual", categories)}
            onBufferUpdate={(value) => updateBufferPercentage("annualBuffer", value)}
          />
        </TabsContent>
      </Tabs>

      {showResults && (
        <ResultsCard expenseData={expenseData} yearsToRetirement={yearsToRetirement} fireMultiplier={fireMultiplier} />
      )}
    </div>
  )
}
