import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InvestmentCalculator from "@/components/investment-calculator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-chart-2" />
                <h1 className="text-xl font-bold text-foreground">Investment Calculator</h1>
              </div>
            </div>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>
              Lumpsum stays invested for the full horizon. SIP runs for the SIP years and then remains invested for the
              remaining years. You can also add additional one-time lumpsums that occur in specific years.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentCalculator />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
