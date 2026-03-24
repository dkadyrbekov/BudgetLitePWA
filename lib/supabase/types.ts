export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category_color_snapshot: string | null;
          category_icon_snapshot: string | null;
          category_id: string | null;
          category_name_snapshot: string;
          created_at: string;
          description: string | null;
          expense_date: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category_color_snapshot?: string | null;
          category_icon_snapshot?: string | null;
          category_id?: string | null;
          category_name_snapshot: string;
          created_at?: string;
          description?: string | null;
          expense_date?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category_color_snapshot?: string | null;
          category_icon_snapshot?: string | null;
          category_id?: string | null;
          category_name_snapshot?: string;
          created_at?: string;
          description?: string | null;
          expense_date?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      incomes: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          income_date: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          income_date?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          income_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
