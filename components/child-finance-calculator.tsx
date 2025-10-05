"use client"

import type * as React from "react"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type CalculatorInputs,
  type MilestoneInput,
  type SimulationResult,
  type YearRow,
  DEFAULT_INPUTS,
  simulatePlan,
  formatINR,
  computeMilestoneSchedule,
} from "@/lib/finance"

type NumberInputProps = {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  className?: string
  suffix?: string
  required?: boolean
}

function NumberField({ id, label, value, onChange, step = 1, min = 0, className, suffix, required }: NumberInputProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value || 0))}
          step={step}
          min={min}
          className="w-full"
          required={required}
        />
        {suffix ? <span className="text-muted-foreground text-sm">{suffix}</span> : null}
      </div>
    </div>
  )
}

export default function FinanceCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const milestoneSchedule = useMemo(() => computeMilestoneSchedule(inputs), [inputs])

  function updateMilestone<K extends keyof MilestoneInput>(
    key: keyof CalculatorInputs["milestones"],
    field: K,
    value: MilestoneInput[K],
  ) {
    setInputs((prev) => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        [key]: {
          ...prev.milestones[key],
          [field]: value,
        },
      },
    }))
  }

  function validate(i: CalculatorInputs): string[] {
    const errs: string[] = []
    if (i.currentAge < 0) errs.push("Current age must be >= 0.")
    const allMilestones = Object.entries(i.milestones) as Array<[string, MilestoneInput]>
    for (const [name, m] of allMilestones) {
      if (m.targetAge <= i.currentAge) {
        errs.push(`${name} age must be greater than current age.`)
      }
      if (m.currentValue < 0) errs.push(`${name} current value cannot be negative.`)
      if (m.inflation < 0) errs.push(`${name} inflation cannot be negative.`)
    }
    if (i.initialInvestment < 0) errs.push("Initial investment cannot be negative.")
    if (i.sipMonthly < 0) errs.push("SIP per month cannot be negative.")
    if (i.stepUpAnnual < 0) errs.push("Step up amount cannot be negative.")
    if (i.cagrPercent < 0) errs.push("CAGR % cannot be negative.")
    if (i.sipYears < 0) errs.push("SIP years cannot be negative.")
    if (i.postSipYears < 0) errs.push("Post-SIP years cannot be negative.")

    const latestMilestoneYear =
      Math.max(0, ...allMilestones.map(([_, m]) => Math.max(0, m.targetAge - i.currentAge))) || 0
    const totalYears = i.sipYears + i.postSipYears
    if (latestMilestoneYear > totalYears) {
      errs.push(
        `Your projection horizon (${totalYears} years) ends before the latest milestone (${latestMilestoneYear} years). Increase SIP years and/or post-SIP years to cover all withdrawals.`,
      )
    }
    return errs
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate(inputs)
    setErrors(v)
    if (v.length) return

    console.log("[fh] Starting simulation with inputs:", inputs)
    const r = simulatePlan(inputs)
    setResult(r)
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-8">
            <fieldset className="grid gap-4 rounded-lg border p-4">
              <legend className="px-1 text-sm font-medium text-muted-foreground">Daughter</legend>
              <NumberField
                id="current-age"
                label="Current Age (years)"
                value={inputs.currentAge}
                onChange={(v) => setInputs((p) => ({ ...p, currentAge: v }))}
                step={1}
                min={0}
                required
              />
            </fieldset>

            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="px-1 text-sm font-medium text-muted-foreground">
                Milestones (Current Value, Target Age, Inflation)
              </legend>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* UG */}
                <div className="grid gap-3 rounded-md border p-3">
                  <div className="text-sm font-medium">Education - UG</div>
                  <NumberField
                    id="ug-current"
                    label="Current Value (INR)"
                    value={inputs.milestones.UG.currentValue}
                    onChange={(v) => updateMilestone("UG", "currentValue", v)}
                    step={1000}
                    min={0}
                  />
                  <NumberField
                    id="ug-age"
                    label="Target Age (years)"
                    value={inputs.milestones.UG.targetAge}
                    onChange={(v) => updateMilestone("UG", "targetAge", v)}
                    step={1}
                    min={inputs.currentAge + 1}
                  />
                  <NumberField
                    id="ug-inflation"
                    label="Inflation (%)"
                    value={inputs.milestones.UG.inflation}
                    onChange={(v) => updateMilestone("UG", "inflation", v)}
                    step={0.1}
                    min={0}
                    suffix="%"
                  />
                </div>

                {/* PG */}
                <div className="grid gap-3 rounded-md border p-3">
                  <div className="text-sm font-medium">Education - PG</div>
                  <NumberField
                    id="pg-current"
                    label="Current Value (INR)"
                    value={inputs.milestones.PG.currentValue}
                    onChange={(v) => updateMilestone("PG", "currentValue", v)}
                    step={1000}
                    min={0}
                  />
                  <NumberField
                    id="pg-age"
                    label="Target Age (years)"
                    value={inputs.milestones.PG.targetAge}
                    onChange={(v) => updateMilestone("PG", "targetAge", v)}
                    step={1}
                    min={inputs.currentAge + 1}
                  />
                  <NumberField
                    id="pg-inflation"
                    label="Inflation (%)"
                    value={inputs.milestones.PG.inflation}
                    onChange={(v) => updateMilestone("PG", "inflation", v)}
                    step={0.1}
                    min={0}
                    suffix="%"
                  />
                </div>

                {/* Business */}
                <div className="grid gap-3 rounded-md border p-3">
                  <div className="text-sm font-medium">Business Seed Funding</div>
                  <NumberField
                    id="biz-current"
                    label="Current Value (INR)"
                    value={inputs.milestones.Business.currentValue}
                    onChange={(v) => updateMilestone("Business", "currentValue", v)}
                    step={1000}
                    min={0}
                  />
                  <NumberField
                    id="biz-age"
                    label="Target Age (years)"
                    value={inputs.milestones.Business.targetAge}
                    onChange={(v) => updateMilestone("Business", "targetAge", v)}
                    step={1}
                    min={inputs.currentAge + 1}
                  />
                  <NumberField
                    id="biz-inflation"
                    label="Inflation (%)"
                    value={inputs.milestones.Business.inflation}
                    onChange={(v) => updateMilestone("Business", "inflation", v)}
                    step={0.1}
                    min={0}
                    suffix="%"
                  />
                </div>

                {/* Marriage */}
                <div className="grid gap-3 rounded-md border p-3">
                  <div className="text-sm font-medium">Marriage Expense</div>
                  <NumberField
                    id="mar-current"
                    label="Current Value (INR)"
                    value={inputs.milestones.Marriage.currentValue}
                    onChange={(v) => updateMilestone("Marriage", "currentValue", v)}
                    step={1000}
                    min={0}
                  />
                  <NumberField
                    id="mar-age"
                    label="Target Age (years)"
                    value={inputs.milestones.Marriage.targetAge}
                    onChange={(v) => updateMilestone("Marriage", "targetAge", v)}
                    step={1}
                    min={inputs.currentAge + 1}
                  />
                  <NumberField
                    id="mar-inflation"
                    label="Inflation (%)"
                    value={inputs.milestones.Marriage.inflation}
                    onChange={(v) => updateMilestone("Marriage", "inflation", v)}
                    step={0.1}
                    min={0}
                    suffix="%"
                  />
                </div>
              </div>

              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                Example: If current age is 3 and target ages are UG 15, PG 19, Business 24, Marriage 25, set Target Age
                accordingly. Costs will be adjusted by their inflation to the event year.
              </div>
            </fieldset>

            <fieldset className="grid gap-4 rounded-lg border p-4">
              <legend className="px-1 text-sm font-medium text-muted-foreground">Investment Details</legend>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <NumberField
                  id="initial"
                  label="Initial Investment (INR)"
                  value={inputs.initialInvestment}
                  onChange={(v) => setInputs((p) => ({ ...p, initialInvestment: v }))}
                  step={1000}
                  min={0}
                />
                <NumberField
                  id="sip"
                  label="SIP per Month (INR)"
                  value={inputs.sipMonthly}
                  onChange={(v) => setInputs((p) => ({ ...p, sipMonthly: v }))}
                  step={500}
                  min={0}
                />
                <NumberField
                  id="stepup"
                  label="Step Up Amount Every Year (INR added to monthly SIP)"
                  value={inputs.stepUpAnnual}
                  onChange={(v) => setInputs((p) => ({ ...p, stepUpAnnual: v }))}
                  step={500}
                  min={0}
                />
                <NumberField
                  id="cagr"
                  label="Expected CAGR (%)"
                  value={inputs.cagrPercent}
                  onChange={(v) => setInputs((p) => ({ ...p, cagrPercent: v }))}
                  step={0.1}
                  min={0}
                  suffix="%"
                />
                <NumberField
                  id="sip-years"
                  label="How many years to do SIP"
                  value={inputs.sipYears}
                  onChange={(v) => setInputs((p) => ({ ...p, sipYears: v }))}
                  step={1}
                  min={0}
                />
                <NumberField
                  id="post-sip-years"
                  label="Remain invested years after SIP"
                  value={inputs.postSipYears}
                  onChange={(v) => setInputs((p) => ({ ...p, postSipYears: v }))}
                  step={1}
                  min={0}
                />
              </div>

              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                SIP step-up logic: each year, your monthly SIP increases by the step-up amount. Example: ₹15,000/mo with
                ₹1,000 step-up becomes ₹16,000/mo in year 2, ₹17,000/mo in year 3, and so on.
              </div>
            </fieldset>

            {errors.length > 0 ? (
              <div className="rounded-md border border-destructive p-3 text-sm">
                <div className="font-medium">Please fix the following:</div>
                <ul className="mt-2 list-disc pl-5">
                  {errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Milestone Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {milestoneSchedule.map((m) => (
              <div key={m.key} className="rounded-md border p-3">
                <div className="text-sm font-medium">{m.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Occurs in {m.yearsFromNow.toFixed(1)} years (at age {m.targetAge})
                </div>
                <div className="mt-2 text-sm">
                  Inflated cost at event: <span className="font-medium">{formatINR(m.inflatedCost)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Costs inflated using each milestone’s inflation rate compounded to its target age.
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Year-by-Year Projection (INR)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 gap-2 rounded-t-md bg-secondary px-3 py-2 text-sm font-medium">
                <div>Year</div>
                <div>Start Balance</div>
                <div>Contributions</div>
                <div>Interest</div>
                <div>Withdrawals</div>
                <div>End Balance</div>
                <div>Milestones</div>
              </div>
              {result.years.map((row: YearRow) => (
                <div key={row.year} className="grid grid-cols-7 items-center gap-2 border-b px-3 py-2 text-sm">
                  <div>{row.year}</div>
                  <div>{formatINR(row.startBalance)}</div>
                  <div>{formatINR(row.contributions)}</div>
                  <div>{formatINR(row.interest)}</div>
                  <div className="text-destructive">{formatINR(row.withdrawals)}</div>
                  <div className="font-medium">{formatINR(row.endBalance)}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.milestoneNotes.length ? row.milestoneNotes.join(", ") : "—"}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-7 gap-2 rounded-b-md bg-secondary/60 px-3 py-2 text-sm font-medium">
                <div>Total</div>
                <div>—</div>
                <div>{formatINR(result.totals.contributions)}</div>
                <div>{formatINR(result.totals.interest)}</div>
                <div className="text-destructive">{formatINR(result.totals.withdrawals)}</div>
                <div className="font-semibold">{formatINR(result.finalBalance)}</div>
                <div>—</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div>
                Final Corpus at end of projection:{" "}
                <span className="font-semibold">{formatINR(result.finalBalance)}</span>
              </div>
              <div className="text-muted-foreground">
                Projection spans {result.meta.totalYears} years ({inputs.sipYears} years SIP + {inputs.postSipYears}{" "}
                years post-SIP). Monthly compounding at {inputs.cagrPercent}% CAGR.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
