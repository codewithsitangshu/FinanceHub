import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Target, Heart, ArrowRight } from "lucide-react"

export default function Home() {
  const calculators = [
    {
      title: "Expense Calculator",
      description:
        "Track and analyze your daily expenses. Get insights into your spending patterns and identify areas to save.",
      icon: Calculator,
      href: "/expense-calculator",
      color: "text-chart-1",
    },
    {
      title: "Investment Calculator",
      description:
        "Calculate potential returns on your investments. Plan your financial future with compound interest projections.",
      icon: TrendingUp,
      href: "/investment-calculator",
      color: "text-chart-2",
    },
    {
      title: "FIRE Calculator",
      description:
        "Determine when you can achieve Financial Independence and Retire Early. Calculate your path to freedom.",
      icon: Target,
      href: "/fire-calculator",
      color: "text-chart-3",
    },
    {
      title: "Child Finance Calculator",
      description:
        "Plan for your child's future financial needs. Calculate education costs, savings goals, and milestones.",
      icon: Heart,
      href: "/child-finance-calculator",
      color: "text-chart-4",
    },
    {
      title: "Three Bucket Strategy Calculator",
      description:
        "The Three Bucket Strategy divides your retirement savings into short-term, medium-term, and long-term buckets",
      icon: Calculator,
      href: "/three-bucket-strategy",
      color: "text-chart-5",
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">FinanceHub</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent">
            <span className="h-2 w-2 rounded-full bg-accent"></span>
            Your Complete Financial Toolkit
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            Smart Financial Calculators for Every Goal
          </h2>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
            Make informed financial decisions with our suite of powerful calculators. From daily expenses to retirement
            planning, we've got you covered.
          </p>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {calculators.map((calc) => {
            const Icon = calc.icon
            return (
              <Link key={calc.href} href={calc.href}>
                <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`rounded-lg bg-muted p-3 ${calc.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{calc.title}</CardTitle>
                    <CardDescription className="text-base">{calc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                      Open Calculator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 FinanceHub. All calculators provide estimates for planning purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
