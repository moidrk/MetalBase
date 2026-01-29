"use client"

import { useState } from "react"
import Link from "next/link"
import { Holding, Metal, Currency } from "@/types/portfolio"
import { formatQuantity } from "@/lib/conversions"
import { formatCurrency, formatCurrencyWithSign, formatPercentage } from "@/lib/formatting"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit2, Trash2, Plus, ArrowUpDown } from "lucide-react"
import { DeleteHoldingDialog } from "./DeleteHoldingDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HoldingsListProps {
  initialHoldings: Holding[]
}

export function HoldingsList({ initialHoldings }: HoldingsListProps) {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings)
  const [deleteHolding, setDeleteHolding] = useState<Holding | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'profitLoss' | 'metal'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterMetal, setFilterMetal] = useState<Metal | 'all'>('all')

  const handleDeleteSuccess = () => {
    if (deleteHolding) {
      setHoldings(holdings.filter((h) => h.id !== deleteHolding.id))
      setDeleteHolding(null)
    }
  }

  const handleSort = (column: 'date' | 'profitLoss' | 'metal') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getSortedAndFilteredHoldings = () => {
    let filtered = holdings

    if (filterMetal !== 'all') {
      filtered = filtered.filter((h) => h.metal === filterMetal)
    }

    return filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.buy_date).getTime() - new Date(b.buy_date).getTime()
      } else if (sortBy === 'profitLoss') {
        const profitLossA = a.profitLoss || 0
        const profitLossB = b.profitLoss || 0
        comparison = profitLossA - profitLossB
      } else if (sortBy === 'metal') {
        comparison = a.metal.localeCompare(b.metal)
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const sortedHoldings = getSortedAndFilteredHoldings()

  const totals = holdings.reduce(
    (acc, holding) => {
      return {
        totalBuyValue: acc.totalBuyValue + holding.buy_price * holding.quantity,
        totalCurrentValue: acc.totalCurrentValue + (holding.currentValue || 0),
        totalProfitLoss: acc.totalProfitLoss + (holding.profitLoss || 0),
        count: acc.count + 1,
      }
    },
    { totalBuyValue: 0, totalCurrentValue: 0, totalProfitLoss: 0, count: 0 }
  )

  const totalProfitLossPercent =
    totals.totalBuyValue > 0 ? (totals.totalProfitLoss / totals.totalBuyValue) * 100 : 0

  if (holdings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No holdings yet. Add one to get started.</p>
        <Button asChild>
          <Link href="/holdings/new">
            <Plus className="mr-2 h-4 w-4" />
            Add First Holding
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select
          value={filterMetal}
          onValueChange={(value) => setFilterMetal(value as Metal | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by metal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Metals</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          {sortedHoldings.length} {sortedHoldings.length === 1 ? 'holding' : 'holdings'}
        </p>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {sortedHoldings.map((holding) => (
          <Card key={holding.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold capitalize">
                    {holding.metal} {holding.purity}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatQuantity(holding.quantity, holding.unit)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/holdings/${holding.id}/edit`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                      setDeleteHolding(holding)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy Price:</span>
                  <span>
                    {formatCurrency(holding.buy_price, holding.currency)}
                  </span>
                </div>
                {holding.currentValue !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Value:</span>
                      <span className="font-medium">
                        {formatCurrency(holding.currentValue, holding.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit/Loss:</span>
                      <span
                        className={
                          (holding.profitLoss || 0) >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {formatCurrencyWithSign(
                          holding.profitLoss || 0,
                          holding.currency
                        )}{' '}
                        ({formatPercentage(holding.profitLossPercent || 0)})
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy Date:</span>
                  <span>{new Date(holding.buy_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block mb-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('metal')}
                    className="flex items-center gap-1 hover:text-foreground text-left"
                  >
                    Metal + Purity
                    {sortBy === 'metal' && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-foreground text-left"
                  >
                    Buy Date
                    {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('profitLoss')}
                    className="flex items-center gap-1 hover:text-foreground text-right"
                  >
                    Profit/Loss
                    {sortBy === 'profitLoss' && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell className="capitalize font-medium">
                    {holding.metal} {holding.purity}
                  </TableCell>
                  <TableCell>{formatQuantity(holding.quantity, holding.unit)}</TableCell>
                  <TableCell>
                    {formatCurrency(holding.buy_price, holding.currency)}
                  </TableCell>
                  <TableCell>
                    {new Date(holding.buy_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(holding.buy_date).toLocaleDateString()}
                  </TableCell>
                  {holding.currentValue !== undefined && (
                    <TableCell className="font-medium">
                      {formatCurrency(holding.currentValue, holding.currency)}
                    </TableCell>
                  )}
                  {holding.profitLoss !== undefined && (
                    <TableCell
                      className={
                        holding.profitLoss >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrencyWithSign(holding.profitLoss, holding.currency)}
                      <span className="ml-1 text-xs">
                        ({formatPercentage(holding.profitLossPercent || 0)})
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/holdings/${holding.id}/edit`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setDeleteHolding(holding)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Totals Row */}
      <div className="rounded-md border bg-muted/50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-lg font-semibold">
              {formatCurrency(totals.totalBuyValue, holdings[0]?.currency || 'PKR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold">
              {formatCurrency(totals.totalCurrentValue, holdings[0]?.currency || 'PKR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
            <p
              className={`text-lg font-semibold ${
                totals.totalProfitLoss >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrencyWithSign(totals.totalProfitLoss, holdings[0]?.currency || 'PKR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total P/L %</p>
            <p
              className={`text-lg font-semibold ${
                totalProfitLossPercent >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPercentage(totalProfitLossPercent)}
            </p>
          </div>
        </div>
      </div>

      <DeleteHoldingDialog
        holding={deleteHolding}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
