"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Holding } from "@/types/portfolio"
import { Loader2 } from "lucide-react"

interface DeleteHoldingDialogProps {
  holding: Holding | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteHoldingDialog({
  holding,
  open,
  onOpenChange,
  onSuccess,
}: DeleteHoldingDialogProps) {
  const [loading, setLoading] = useState(false)

  const onDelete = async () => {
    if (!holding) return
    setLoading(true)
    try {
      const response = await fetch(`/api/holdings/${holding.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete holding")
      onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  if (!holding) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Holding?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            holding of {holding.quantity} {holding.unit} {holding.metal}{" "}
            {holding.purity}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
