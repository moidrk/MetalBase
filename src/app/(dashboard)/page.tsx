import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {user?.email}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-medium">Total Holdings</h3>
          <p className="text-3xl font-bold mt-2">$0.00</p>
          <p className="text-sm text-muted-foreground mt-1">0 items</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-medium">Gold</h3>
          <p className="text-3xl font-bold mt-2">$0.00</p>
          <p className="text-sm text-muted-foreground mt-1">0 oz</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-medium">Silver</h3>
          <p className="text-3xl font-bold mt-2">$0.00</p>
          <p className="text-sm text-muted-foreground mt-1">0 oz</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-medium">Recommendations</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-muted-foreground mt-1">AI suggestions</p>
        </div>
      </div>
    </div>
  );
}
