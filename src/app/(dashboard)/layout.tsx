import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Auth is handled by middleware, not here
  // Only fetch user for display purposes in the UI
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const handleSignOut = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-emerald-600">
              MetalBase
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm font-medium hover:text-emerald-600">
                Dashboard
              </Link>
              <Link href="/holdings" className="text-sm font-medium hover:text-emerald-600">
                Holdings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email || 'Loading...'}
            </span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
