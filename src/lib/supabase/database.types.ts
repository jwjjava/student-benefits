// 자동 생성 파일: Supabase 프로젝트 student-benefits 의 스키마에서 생성했다. 직접 고치지 않는다.
// 스키마를 바꾸면 다시 생성한다:
//   npx supabase gen types typescript --project-id xalahmhyzmumxctowcdx > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          apply_url: string
          card_note: string
          category_id: string
          created_at: string
          eligibility: string[]
          end_date: string | null
          id: string
          image_url: string | null
          is_always_open: boolean
          is_published: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          place_name: string | null
          provider: string
          recommend_rank: number
          slug: string
          source_name: string
          source_url: string
          start_date: string | null
          tags: string[]
          title: string
          updated_at: string
          usage_method: string
          verified_at: string | null
        }
        Insert: {
          apply_url: string
          card_note?: string
          category_id: string
          created_at?: string
          eligibility?: string[]
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_always_open?: boolean
          is_published?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          place_name?: string | null
          provider: string
          recommend_rank?: number
          slug: string
          source_name: string
          source_url: string
          start_date?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          usage_method?: string
          verified_at?: string | null
        }
        Update: {
          apply_url?: string
          card_note?: string
          category_id?: string
          created_at?: string
          eligibility?: string[]
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_always_open?: boolean
          is_published?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          place_name?: string | null
          provider?: string
          recommend_rank?: number
          slug?: string
          source_name?: string
          source_url?: string
          start_date?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          usage_method?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      error_reports: {
        Row: {
          benefit_id: string
          created_at: string
          id: number
          kind: string
          message: string
          visitor_id: string
        }
        Insert: {
          benefit_id: string
          created_at?: string
          id?: never
          kind: string
          message?: string
          visitor_id: string
        }
        Update: {
          benefit_id?: string
          created_at?: string
          id?: never
          kind?: string
          message?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          benefit_id: string | null
          created_at: string
          id: number
          name: string
          path: string | null
          props: Json
          visitor_id: string
        }
        Insert: {
          benefit_id?: string | null
          created_at?: string
          id?: never
          name: string
          path?: string | null
          props?: Json
          visitor_id: string
        }
        Update: {
          benefit_id?: string | null
          created_at?: string
          id?: never
          name?: string
          path?: string | null
          props?: Json
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          benefit_id: string
          created_at: string
          id: number
          knew_before: boolean | null
          response: string
          visitor_id: string
        }
        Insert: {
          benefit_id: string
          created_at?: string
          id?: never
          knew_before?: boolean | null
          response: string
          visitor_id: string
        }
        Update: {
          benefit_id?: string
          created_at?: string
          id?: never
          knew_before?: boolean | null
          response?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      benefit_popularity: {
        Args: never
        Returns: {
          benefit_id: string
          score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
