export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'employer' | 'seeker'
export type EmploymentType = 'full' | 'part' | 'gig'
export type ExperienceLevel = 'none' | 'junior' | 'middle' | 'senior'
export type ApplicationStatus = 'new' | 'viewed' | 'contacted' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  telegram_chat_id: number | null
  telegram_link_token: string | null
  telegram_link_token_expires_at: string | null
  district: string | null
  created_at: string
}

export interface SeekerProfile {
  profile_id: string
  about: string | null
  skills: string[]
  experience_years: number
  desired_employment: EmploymentType | null
  embedding: number[] | null
}

export interface EmployerProfile {
  profile_id: string
  company_name: string
  company_type: string | null
}

export interface Job {
  id: string
  employer_id: string | null
  title: string
  description: string
  category: string | null
  district: string | null
  employment: EmploymentType | null
  experience_required: ExperienceLevel
  salary_from: number | null
  salary_to: number | null
  skills_required: string[]
  embedding: number[] | null
  is_active: boolean
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  seeker_id: string
  message: string | null
  status: ApplicationStatus
  match_score: number | null
  created_at: string
}

export interface MatchedJob {
  id: string
  title: string
  description: string
  category: string | null
  district: string | null
  employment: EmploymentType | null
  experience_required: ExperienceLevel
  salary_from: number | null
  salary_to: number | null
  skills_required: string[]
  employer_id: string
  company_name: string | null
  created_at: string
  similarity: number
}

export interface MatchedSeeker {
  profile_id: string
  full_name: string | null
  phone: string | null
  district: string | null
  about: string | null
  skills: string[]
  experience_years: number
  desired_employment: EmploymentType | null
  similarity: number
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Profile>
        Relationships: []
      }
      seeker_profiles: {
        Row: SeekerProfile
        Insert: Partial<SeekerProfile> & { profile_id: string }
        Update: Partial<SeekerProfile>
        Relationships: []
      }
      employer_profiles: {
        Row: EmployerProfile
        Insert: EmployerProfile
        Update: Partial<EmployerProfile>
        Relationships: []
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at' | 'is_active'> & {
          id?: string
          created_at?: string
          is_active?: boolean
        }
        Update: Partial<Job>
        Relationships: []
      }
      applications: {
        Row: Application
        Insert: Omit<Application, 'id' | 'created_at' | 'status'> & {
          id?: string
          created_at?: string
          status?: ApplicationStatus
        }
        Update: Partial<Application>
        Relationships: []
      }
      match_explanations: {
        Row: {
          id: string
          job_id: string
          seeker_id: string
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          seeker_id: string
          explanation: string
          created_at?: string
        }
        Update: Partial<{
          id: string
          job_id: string
          seeker_id: string
          explanation: string
          created_at: string
        }>
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          kind: 'new_job_match' | 'new_application'
          payload: Json
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          kind: 'new_job_match' | 'new_application'
          payload: Json
          sent_at?: string | null
          created_at?: string
        }
        Update: Partial<{
          id: string
          recipient_id: string
          kind: 'new_job_match' | 'new_application'
          payload: Json
          sent_at: string | null
          created_at: string
        }>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      match_jobs_for_seeker: {
        Args: {
          p_seeker_id: string
          p_count?: number
          p_filter_district?: string | null
          p_filter_category?: string | null
        }
        Returns: MatchedJob[]
      }
      match_seekers_for_job: {
        Args: {
          p_job_id: string
          p_count?: number
        }
        Returns: MatchedSeeker[]
      }
    }
    Enums: {
      user_role: UserRole
      employment_type: EmploymentType
      experience_level: ExperienceLevel
      application_status: ApplicationStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
