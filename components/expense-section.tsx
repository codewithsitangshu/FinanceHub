"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, FolderPlus } from "lucide-react"
import type { Category, SubCategory } from "./expense-calculator"

interface ExpenseSectionProps {
  title: string
  description: string
  categories: Category[]
  bufferPercentage: number
  onUpdate: (categories: Category[]) => void
  onBufferUpdate: (value: number) => void
}

export default function ExpenseSection({
  title,
  description,
  categories,
  bufferPercentage,
  onUpdate,
  onBufferUpdate,
}: ExpenseSectionProps) {
  const addCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: "New Category",
      subCategories: [],
    }
    onUpdate([...categories, newCategory])
  }

  const removeCategory = (categoryId: string) => {
    onUpdate(categories.filter((cat) => cat.id !== categoryId))
  }

  const updateCategoryName = (categoryId: string, name: string) => {
    onUpdate(categories.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat)))
  }

  const addSubCategory = (categoryId: string) => {
    const newSubCategory: SubCategory = {
      id: `sub-${Date.now()}`,
      name: "New Subcategory",
      amount: 0,
      inflationRate: 5,
    }
    onUpdate(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, subCategories: [...cat.subCategories, newSubCategory] } : cat,
      ),
    )
  }

  const removeSubCategory = (categoryId: string, subCategoryId: string) => {
    onUpdate(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subCategories: cat.subCategories.filter((sub) => sub.id !== subCategoryId),
            }
          : cat,
      ),
    )
  }

  const updateSubCategory = (
    categoryId: string,
    subCategoryId: string,
    field: keyof SubCategory,
    value: string | number,
  ) => {
    onUpdate(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subCategories: cat.subCategories.map((sub) =>
                sub.id === subCategoryId ? { ...sub, [field]: value } : sub,
              ),
            }
          : cat,
      ),
    )
  }

  const calculateTotalExpenses = () => {
    return categories.reduce((total, category) => {
      return total + category.subCategories.reduce((catTotal, sub) => catTotal + sub.amount, 0)
    }, 0)
  }

  const totalExpenses = calculateTotalExpenses()
  const bufferAmount = (totalExpenses * bufferPercentage) / 100

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-accent/10 border-2 border-dashed">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={addCategory} size="lg" className="gap-2 whitespace-nowrap">
          <FolderPlus className="h-5 w-5" />
          Add New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Get started by adding your first expense category. You can customize the name and add subcategories to
              organize your expenses.
            </p>
            <Button onClick={addCategory} size="lg" className="gap-2">
              <FolderPlus className="h-5 w-5" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => (
          <Card key={category.id} className="border-2">
            <CardHeader className="pb-4 bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Category Name</Label>
                  <Input
                    value={category.name}
                    onChange={(e) => updateCategoryName(category.id, e.target.value)}
                    className="font-semibold text-base border-2"
                    placeholder="Enter category name..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addSubCategory(category.id)} variant="secondary" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subcategory
                  </Button>
                  <Button onClick={() => removeCategory(category.id)} variant="ghost" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.subCategories.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">No subcategories in this category yet.</p>
                    <Button onClick={() => addSubCategory(category.id)} variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Subcategory
                    </Button>
                  </div>
                ) : (
                  category.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg bg-muted/50 items-end"
                    >
                      <div className="md:col-span-5">
                        <Label className="text-xs text-muted-foreground">Subcategory Name</Label>
                        <Input
                          value={subCategory.name}
                          onChange={(e) => updateSubCategory(category.id, subCategory.id, "name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={subCategory.amount}
                          onChange={(e) =>
                            updateSubCategory(category.id, subCategory.id, "amount", Number(e.target.value))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs text-muted-foreground">Inflation Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={subCategory.inflationRate}
                          onChange={(e) =>
                            updateSubCategory(category.id, subCategory.id, "inflationRate", Number(e.target.value))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          onClick={() => removeSubCategory(category.id, subCategory.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Card className="border-2 border-dashed bg-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Emergency Buffer</h3>
              <p className="text-sm text-muted-foreground">Add a percentage buffer to total expenses</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="buffer-percentage">Buffer Percentage (%)</Label>
              <Input
                id="buffer-percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                value={bufferPercentage}
                onChange={(e) => onBufferUpdate(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-lg font-semibold">₹{totalExpenses.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10">
              <p className="text-xs text-muted-foreground mb-1">Buffer Amount</p>
              <p className="text-lg font-semibold text-accent">₹{bufferAmount.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
