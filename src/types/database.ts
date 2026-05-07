export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type BuildingStatus = 'trial' | 'active' | 'suspended' | 'cancelled'
export type BuildingPlan   = 'basico' | 'pro' | 'premium'
export type UserRole       = 'superadmin' | 'admin' | 'resident'
export type PaymentStatus  = 'pending' | 'paid' | 'overdue' | 'waived'
export type AlertType      = 'overdue' | 'due_soon' | 'payment_received' | 'maintenance' | 'notice'
export type MaintenanceStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type MaintenancePriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Database {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string
          slug: string
          name: string
          address: string | null
          city: string | null
          total_units: number
          plan: BuildingPlan
          status: BuildingStatus
          trial_ends_at: string | null
          billing_day: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['buildings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['buildings']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          building_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          role: UserRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      units: {
        Row: {
          id: string
          building_id: string
          number: string
          floor: number | null
          type: string
          area_m2: number | null
          owner_id: string | null
          resident_id: string | null
          is_occupied: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['units']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['units']['Insert']>
      }
      fee_periods: {
        Row: {
          id: string
          building_id: string
          period_month: string
          amount: number
          due_date: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fee_periods']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fee_periods']['Insert']>
      }
      payments: {
        Row: {
          id: string
          building_id: string
          unit_id: string
          period_id: string
          amount: number
          status: PaymentStatus
          paid_at: string | null
          payment_method: string | null
          receipt_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          building_id: string
          unit_id: string | null
          payment_id: string | null
          type: AlertType
          title: string
          message: string | null
          is_read: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
      maintenances: {
        Row: {
          id: string
          building_id: string
          title: string
          description: string | null
          category: string
          status: MaintenanceStatus
          priority: MaintenancePriority
          assigned_to: string | null
          estimated_cost: number | null
          actual_cost: number | null
          scheduled_date: string | null
          completed_at: string | null
          reported_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenances']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['maintenances']['Insert']>
      }
      notices: {
        Row: {
          id: string
          building_id: string
          author_id: string | null
          title: string
          body: string
          category: string
          pinned: boolean
          published_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notices']['Insert']>
      }
      expenses: {
        Row: {
          id: string
          building_id: string
          category: string
          description: string
          amount: number
          expense_date: string
          receipt_url: string | null
          approved_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
    }
  }
}

// Tipos derivados útiles
export type Building    = Database['public']['Tables']['buildings']['Row']
export type Profile     = Database['public']['Tables']['profiles']['Row']
export type Unit        = Database['public']['Tables']['units']['Row']
export type FeePeriod   = Database['public']['Tables']['fee_periods']['Row']
export type Payment     = Database['public']['Tables']['payments']['Row']
export type Alert       = Database['public']['Tables']['alerts']['Row']
export type Maintenance = Database['public']['Tables']['maintenances']['Row']
export type Notice      = Database['public']['Tables']['notices']['Row']
export type Expense     = Database['public']['Tables']['expenses']['Row']

// Tipos con joins
export type PaymentWithUnit = Payment & {
  units: Pick<Unit, 'number' | 'floor'>
  profiles: Pick<Profile, 'full_name' | 'email' | 'phone'> | null
}

export type UnitWithOwner = Unit & {
  owner: Profile | null
  resident: Profile | null
}
