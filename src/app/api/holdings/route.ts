import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getHoldings, createHolding } from "@/lib/supabase/holdings";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const holdings = await getHoldings(supabase, user.id);
    return NextResponse.json(holdings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const holding = await createHolding(supabase, {
      ...body,
      user_id: user.id,
    });
    return NextResponse.json(holding);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
