import BucketCalculator from "@/components/three-bucket-calculator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, ArrowLeft } from "lucide-react"

export default function Home() {
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
                <Calculator className="h-6 w-6 text-chart-5" />
                <h1 className="text-xl font-bold text-foreground">Three Bucket Strategy Calculator</h1>
                <p className="text-muted-foreground">
                  Plan your retirement corpus with a systematic withdrawal strategy
                </p>
              </div>
            </div>
          </div>
        </header>
        <BucketCalculator />
      </section>
    </main>
  )
}