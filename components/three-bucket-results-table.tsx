"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

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

interface ResultsTableProps {
  data: MonthlyData[]
  yearsLasted: number | null
}

export default function ResultsTable({ data, yearsLasted }: ResultsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const totalCorpus = data.length > 0 ? data[0].b1Corpus + data[0].b2Corpus + data[0].b3aCorpus + data[0].b3bCorpus : 0
  const finalCorpus =
    data.length > 0
      ? data[data.length - 1].b1Corpus +
        data[data.length - 1].b2Corpus +
        data[data.length - 1].b3aCorpus +
        data[data.length - 1].b3bCorpus
      : 0

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="bg-card">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground mb-2">Calculation Results</CardTitle>
            <CardDescription className="text-muted-foreground">
              Month-by-month breakdown of your retirement corpus
            </CardDescription>
          </div>
          <div className="text-right">
            {yearsLasted === null ? (
              <Badge className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-base">
                <CheckCircle className="mr-2 h-4 w-4" />
                Corpus Lasts ∞ (40+ Years)
              </Badge>
            ) : yearsLasted === 0 ? (
              <Badge variant="destructive" className="px-4 py-2 text-base">
                <AlertCircle className="mr-2 h-4 w-4" />
                Insufficient Corpus
              </Badge>
            ) : (
              <Badge className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 text-base">
                <TrendingUp className="mr-2 h-4 w-4" />
                Lasts {yearsLasted} Years
              </Badge>
            )}
            <div className="mt-2 text-sm text-muted-foreground">Initial Corpus: {formatCurrency(totalCorpus)}</div>
            <div className="text-sm text-muted-foreground">Final Corpus: {formatCurrency(finalCorpus)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="rounded-lg border-2 border-primary overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="bg-primary sticky top-0 z-10">
                <TableRow className="hover:bg-primary">
                  <TableHead className="text-primary-foreground font-bold">Month</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">Requirement</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">Dividend</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B1 Corpus</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B2 Corpus</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B2 Returns</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B2 Returns %</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B3A (Stocks)</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">B3B (MF)</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">Market Returns</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-right">Market Returns %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={row.month} className={index % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <TableCell className="font-medium text-foreground">
                      {row.month}
                      {row.month % 12 === 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">(Year {row.month / 12})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-foreground">{formatCurrency(row.requirement)}</TableCell>
                    <TableCell className="text-right text-green-700">{formatCurrency(row.dividend)}</TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      {formatCurrency(row.b1Corpus)}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      {formatCurrency(row.b2Corpus)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${row.b2Returns >= 0 ? "text-green-700" : "text-red-600"}`}
                    >
                      {formatCurrency(row.b2Returns)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${row.b2ReturnsPercent >= 0 ? "text-green-700" : "text-red-600"}`}
                    >
                      {formatPercent(row.b2ReturnsPercent)}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      {formatCurrency(row.b3aCorpus)}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      {formatCurrency(row.b3bCorpus)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${row.marketReturns >= 0 ? "text-green-700" : "text-red-600"}`}
                    >
                      {formatCurrency(row.marketReturns)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${row.marketReturnsPercent >= 0 ? "text-green-700" : "text-red-600"}`}
                    >
                      {formatPercent(row.marketReturnsPercent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4 text-destructive" />
            <p className="text-lg font-medium text-foreground">Insufficient Corpus</p>
            <p className="mt-2">
              Your total corpus is not enough to cover the initial bucket requirements. Please increase your investment
              amounts or reduce monthly requirements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
