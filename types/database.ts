export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          subscription_status: "free" | "pro" | "enterprise";
          rfc_queries_this_month: number;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscription_status?: "free" | "pro" | "enterprise";
          rfc_queries_this_month?: number;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscription_status?: "free" | "pro" | "enterprise";
          rfc_queries_this_month?: number;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
      };
      validations: {
        Row: {
          id: string;
          user_id: string;
          rfc: string;
          is_valid: boolean;
          response_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rfc: string;
          is_valid: boolean;
          response_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rfc?: string;
          is_valid?: boolean;
          response_time?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          plan: "pro" | "enterprise";
          status: "active" | "canceled";
          current_period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          plan: "pro" | "enterprise";
          status: "active" | "canceled";
          current_period_end: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          plan?: "pro" | "enterprise";
          status?: "active" | "canceled";
          current_period_end?: string;
          created_at?: string;
        };
      };
    };
  };
}

