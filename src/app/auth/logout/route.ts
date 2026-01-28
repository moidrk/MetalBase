import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/auth/login?error=signout_failed");
  }

  redirect("/auth/login");
}
