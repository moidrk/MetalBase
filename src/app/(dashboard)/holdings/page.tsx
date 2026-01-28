import { Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getHoldings } from "@/lib/supabase/holdings"
import { HoldingsList } from "@/components/portfolio/HoldingsList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

async function HoldingsData() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  try {
    const holdings = await getHoldings(supabase, user.id)
    return <HoldingsList initialHoldings={holdings} />
  } catch (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">Error loading holdings.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }
}

export default function HoldingsPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Holdings</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/holdings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Holding
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading holdings...</div>}>
        <HoldingsData />
      </Suspense>
    </div>
  )
}
