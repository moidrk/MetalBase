import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  user_id: string;
  metal: string;
  purity: string;
  quantity: number;
  unit: string;
  buy_price: number;
  currency: string;
  buy_date: string;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  date: string;
  metal: string;
  advice: string;
  summary_text: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  dismissed: boolean;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      holdings: {
        Row: Holding;
        Insert: Omit<Holding, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Holding, "id">>;
      };
      ai_recommendations: {
        Row: AIRecommendation;
        Insert: Omit<AIRecommendation, "id" | "created_at">;
        Update: Partial<Omit<AIRecommendation, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id">>;
      };
    };
  };
};

export type AuthUser = User;
