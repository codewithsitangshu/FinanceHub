import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import FireCalculator from "@/components/fire-calculator"
import { Button } from "@/components/ui/button"
import { Target, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "FIRE Calculator",
  description: "Project your financial independence (FIRE) year with inflation, SIP step-up, and CAGR.",
}

export default function Page() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <section className="space-y-4">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-chart-3" />
                <h1 className="text-xl font-bold text-foreground">FIRE Calculator</h1>
                <p className="text-muted-foreground">
                  Calculate your estimated FIRE year based on your inputs. The target is 60× of that year&apos;s annual
                  expenses, adjusted for inflation.
                </p>
              </div>
            </div>
          </div>
        </header>
      </section>

      <Suspense fallback={<div className="mt-6 text-muted-foreground">Loading calculator…</div>}>
        <FireCalculator />
      </Suspense>
    </main>
  )
}