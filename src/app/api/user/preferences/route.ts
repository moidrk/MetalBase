import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If preferences don't exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            currency: 'PKR',
            unit: 'tola',
            price_alert_threshold: 5,
            push_notifications: true,
            notification_frequency: 'daily',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return NextResponse.json(newPrefs);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate currency
    if (body.currency && !['USD', 'PKR', 'BOTH'].includes(body.currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Must be USD, PKR, or BOTH" },
        { status: 400 }
      );
    }

    // Validate unit
    if (body.unit && !['tola', 'gram', 'ounce', 'kilogram'].includes(body.unit)) {
      return NextResponse.json(
        { error: "Invalid unit. Must be tola, gram, ounce, or kilogram" },
        { status: 400 }
      );
    }

    // Validate notification_frequency
    if (body.notification_frequency && !['daily', 'weekly', 'monthly', 'never'].includes(body.notification_frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency. Must be daily, weekly, monthly, or never" },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const { data: existing, error: checkError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let result;

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .update({
          currency: body.currency ?? existing.currency,
          unit: body.unit ?? existing.unit,
          price_alert_threshold: body.price_alert_threshold ?? existing.price_alert_threshold,
          push_notifications: body.push_notifications ?? existing.push_notifications,
          notification_frequency: body.notification_frequency ?? existing.notification_frequency,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          currency: body.currency || 'PKR',
          unit: body.unit || 'tola',
          price_alert_threshold: body.price_alert_threshold || 5,
          push_notifications: body.push_notifications ?? true,
          notification_frequency: body.notification_frequency || 'daily',
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    console.log(`User preferences updated for user ${user.id}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user preferences" },
      { status: 500 }
    );
  }
}

// Support PUT as well for consistency
export async function PUT(request: NextRequest) {
  return POST(request);
}
