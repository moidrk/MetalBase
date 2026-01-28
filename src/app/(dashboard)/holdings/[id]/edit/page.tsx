import { createClient } from "@/lib/supabase/server"
import { getHolding } from "@/lib/supabase/holdings"
import { HoldingForm } from "@/components/portfolio/HoldingForm"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export default async function EditHoldingPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let holding
  try {
    holding = await getHolding(supabase, params.id)
    if (holding.user_id !== user.id) {
      notFound()
    }
  } catch (error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/holdings">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Holding</h1>
      </div>

      <HoldingForm initialData={holding} isEditing />
    </div>
  )
}
