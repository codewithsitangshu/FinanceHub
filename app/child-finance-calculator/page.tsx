import Link from "next/link"
import ChildFinanceCalculator from "@/components/child-finance-calculator"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-chart-4" />
                <h1 className="text-xl font-bold text-foreground">Child Future Finance Plan Calculator</h1>
                <p className="text-muted-foreground">
                  Plan SIP, step-up, and milestone withdrawals (UG, PG, Business Seed, Marriage) with inflation-adjusted
                  costs.
                </p>
              </div>
            </div>
          </div>
        </header>
        <ChildFinanceCalculator />
      </section>
    </main>
  )
}
