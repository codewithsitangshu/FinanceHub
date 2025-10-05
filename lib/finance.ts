export type MilestoneInput = {
  currentValue: number // INR today
  targetAge: number // daughter's age at event
  inflation: number // % per annum
}

export type CalculatorInputs = {
  currentAge: number
  milestones: {
    UG: MilestoneInput
    PG: MilestoneInput
    Business: MilestoneInput
    Marriage: MilestoneInput
  }
  initialInvestment: number // lump sum today
  sipMonthly: number // monthly SIP today
  stepUpAnnual: number // increment to monthly SIP each year
  cagrPercent: number // annual expected return %
  sipYears: number // years contributing SIP
  postSipYears: number // years remain invested after SIP
}

export type MilestoneScheduleItem = {
  key: "UG" | "PG" | "Business" | "Marriage"
  label: string
  targetAge: number
  yearsFromNow: number
  eventMonth: number // 0-based month index from now
  inflatedCost: number
}

export type YearRow = {
  year: number // 1..N
  startBalance: number
  contributions: number
  interest: number
  withdrawals: number
  endBalance: number
  milestoneNotes: string[]
}

export type SimulationResult = {
  years: YearRow[]
  finalBalance: number
  totals: {
    contributions: number
    interest: number
    withdrawals: number
  }
  meta: {
    totalYears: number
    totalMonths: number
  }
}

export const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 3,
  milestones: {
    UG: { currentValue: 0, targetAge: 15, inflation: 6 },
    PG: { currentValue: 0, targetAge: 19, inflation: 6 },
    Business: { currentValue: 0, targetAge: 24, inflation: 5 },
    Marriage: { currentValue: 0, targetAge: 25, inflation: 5 },
  },
  initialInvestment: 170000,
  sipMonthly: 15000,
  stepUpAnnual: 1000,
  cagrPercent: 12,
  sipYears: 20,
  postSipYears: 25,
}

// INR formatter (en-IN)
export function formatINR(x: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(x))
  } catch {
    // Fallback
    return `₹${Math.round(x).toLocaleString("en-IN")}`
  }
}

function toMonthlyRate(annualPct: number): number {
  const r = annualPct / 100
  return Math.pow(1 + r, 1 / 12) - 1
}

function inflate(presentValue: number, annualInflationPct: number, years: number): number {
  const i = annualInflationPct / 100
  return presentValue * Math.pow(1 + i, Math.max(0, years))
}

export function computeMilestoneSchedule(inputs: CalculatorInputs): MilestoneScheduleItem[] {
  const { currentAge, milestones } = inputs
  const order: Array<keyof CalculatorInputs["milestones"]> = ["UG", "PG", "Business", "Marriage"]

  return order.map((key) => {
    const m = milestones[key]
    const yearsFromNow = Math.max(0, m.targetAge - currentAge)
    const eventMonth = Math.round(yearsFromNow * 12)
    const inflatedCost = inflate(m.currentValue, m.inflation, yearsFromNow)
    const labelMap = {
      UG: "UG",
      PG: "PG",
      Business: "Business",
      Marriage: "Marriage",
    } as const
    return {
      key: key as MilestoneScheduleItem["key"],
      label: labelMap[key] as string,
      targetAge: m.targetAge,
      yearsFromNow,
      eventMonth,
      inflatedCost,
    }
  })
}

export function simulatePlan(inputs: CalculatorInputs): SimulationResult {
  const { currentAge, milestones, initialInvestment, sipMonthly, stepUpAnnual, cagrPercent, sipYears, postSipYears } =
    inputs

  const totalYears = sipYears + postSipYears
  const totalMonths = totalYears * 12
  const sipMonths = sipYears * 12
  const monthlyRate = toMonthlyRate(cagrPercent)

  // Precompute milestone schedule
  const schedule = computeMilestoneSchedule(inputs)

  let balance = initialInvestment
  let totalContrib = 0
  let totalInterest = 0
  let totalWithdrawals = 0

  const years: YearRow[] = []
  let yearStartBalance = balance
  let yearContrib = 0
  let yearInterest = 0
  let yearWithdrawals = 0
  let yearMilestones: string[] = []

  for (let month = 0; month < totalMonths; month++) {
    const yearIndex = Math.floor(month / 12) // 0-based
    const isFirstMonthOfYear = month % 12 === 0

    if (isFirstMonthOfYear && month > 0) {
      const endBalance = balance
      years.push({
        year: yearIndex,
        startBalance: yearStartBalance,
        contributions: yearContrib,
        interest: yearInterest,
        withdrawals: yearWithdrawals,
        endBalance,
        milestoneNotes: yearMilestones,
      })
      // reset for next year
      yearStartBalance = endBalance
      yearContrib = 0
      yearInterest = 0
      yearWithdrawals = 0
      yearMilestones = []
    }

    // Contribution (monthly), with annual step-up
    if (month < sipMonths) {
      const monthlyContribution = sipMonthly + yearIndex * stepUpAnnual
      balance += monthlyContribution
      yearContrib += monthlyContribution
      totalContrib += monthlyContribution
    }

    // Growth
    const interest = balance * monthlyRate
    balance += interest
    yearInterest += interest
    totalInterest += interest

    // Milestone withdrawals at this month, if any
    const due = schedule.filter((m) => m.eventMonth === month)
    for (const m of due) {
      if (m.yearsFromNow <= totalYears) {
        const withdraw = Math.min(balance, m.inflatedCost)
        balance -= withdraw
        yearWithdrawals += withdraw
        totalWithdrawals += withdraw
        const eventYear = Math.floor(month / 12) + 1
        yearMilestones.push(`${m.label} (Y${eventYear}): -${formatINR(withdraw)}`)
      }
    }
  }

  // Push final year row
  const finalEndBalance = balance
  years.push({
    year: totalYears,
    startBalance: yearStartBalance,
    contributions: yearContrib,
    interest: yearInterest,
    withdrawals: yearWithdrawals,
    endBalance: finalEndBalance,
    milestoneNotes: yearMilestones,
  })

  return {
    years,
    finalBalance: finalEndBalance,
    totals: {
      contributions: totalContrib,
      interest: totalInterest,
      withdrawals: totalWithdrawals,
    },
    meta: {
      totalYears,
      totalMonths,
    },
  }
}
