"use client"

import { useState } from "react"
import Link from "next/link"
import { Holding } from "@/types/portfolio"
import { formatQuantity } from "@/lib/conversions"
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
import { Edit2, Trash2, Plus } from "lucide-react"
import { DeleteHoldingDialog } from "./DeleteHoldingDialog"

interface HoldingsListProps {
  initialHoldings: Holding[]
}

export function HoldingsList({ initialHoldings }: HoldingsListProps) {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings)
  const [deleteHolding, setDeleteHolding] = useState<Holding | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteSuccess = () => {
    if (deleteHolding) {
      setHoldings(holdings.filter((h) => h.id !== deleteHolding.id))
      setDeleteHolding(null)
    }
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No holdings yet. Add one to get started.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
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
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {holdings.map((holding) => (
          <Card key={holding.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold capitalize">
                    {holding.metal} {holding.purity}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatQuantity(holding.quantity, holding.unit)}
                  </p>
                  <p className="text-sm mt-1">
                    {holding.buy_price.toLocaleString()} {holding.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(holding.buy_date).toLocaleDateString()}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metal + Purity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Buy Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell className="capitalize font-medium">
                    {holding.metal} {holding.purity}
                  </TableCell>
                  <TableCell>{formatQuantity(holding.quantity, holding.unit)}</TableCell>
                  <TableCell>
                    {holding.buy_price.toLocaleString()} {holding.currency}
                  </TableCell>
                  <TableCell>{new Date(holding.buy_date).toLocaleDateString()}</TableCell>
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

      <DeleteHoldingDialog
        holding={deleteHolding}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
