/** Shared API contract. Database field names stay snake_case to avoid mapping drift. */
export const PIPELINE_STAGES = ['prospect', 'contacted', 'in_talks', 'committed', 'received'] as const
export type PipelineStage = typeof PIPELINE_STAGES[number]
export const STAGE_LABELS: Record<PipelineStage, string> = {
  prospect: 'Prospect', contacted: 'Contacted', in_talks: 'In talks',
  committed: 'Committed', received: 'Received',
}
export const SPONSOR_TIERS = ['unknown', 'bronze', 'silver', 'gold', 'partner'] as const
export type SponsorTier = typeof SPONSOR_TIERS[number]
export type MemberRole = 'admin' | 'officer' | 'member'
export type UUID = string
/** YYYY-MM-DD, without a time zone. */
export type DateOnly = string
/** ISO 8601 timestamp. */
export type Timestamp = string

interface Timestamps { created_at: Timestamp; updated_at: Timestamp }

export interface Member extends Timestamps {
  id: UUID
  full_name: string
  role: MemberRole
}

export interface Company extends Timestamps {
  id: UUID
  name: string
  industry: string | null
  website: string | null
  notes: string | null
  archived_at: Timestamp | null
  created_by: UUID | null
  updated_by: UUID | null
  /** @deprecated Compatibility with Rishith's company form. Use contacts instead. */
  contact_name: string | null
  /** @deprecated Use contacts instead. */
  contact_email: string | null
  /** @deprecated Use contacts instead. */
  contact_phone: string | null
  /** @deprecated Tier belongs on each semester's sponsorship request. */
  tier: SponsorTier
  /** @deprecated Company status is not a pipeline request stage. */
  status: PipelineStage | 'inactive'
}

export interface Contact extends Timestamps {
  id: UUID
  company_id: UUID
  name: string
  title: string | null
  email: string | null
  phone: string | null
  notes: string
}

export interface Semester extends Timestamps {
  id: UUID
  name: string
  starts_on: DateOnly
  ends_on: DateOnly
  /** USD, two decimal places. */
  fundraising_goal: number
}

export interface SponsorshipRequest extends Timestamps {
  id: UUID
  company_id: UUID
  semester_id: UUID
  owner_id: UUID | null
  stage: PipelineStage
  /** USD, two decimal places; zero means amount not yet known. */
  amount: number
  tier: SponsorTier
  notes: string
}

export interface FollowUp extends Timestamps {
  id: UUID
  company_id: UUID
  assignee_id: UUID | null
  task: string
  due_on: DateOnly
  done: boolean
  /** Set/cleared by the database when done changes. */
  completed_at: Timestamp | null
}

type NewRow<T, Required extends keyof T, Managed extends keyof T = never> =
  Pick<T, Required> & Partial<Omit<T, Required | Managed>>
type Managed = 'id' | 'created_at' | 'updated_at'
export type CompanyInsert = NewRow<Company, 'name', Managed | 'created_by' | 'updated_by'>
export type ContactInsert = NewRow<Contact, 'company_id' | 'name', Managed>
export type SemesterInsert = NewRow<Semester, 'name' | 'starts_on' | 'ends_on', Managed>
export type SponsorshipRequestInsert = NewRow<SponsorshipRequest, 'company_id' | 'semester_id', Managed>
export type FollowUpInsert = NewRow<FollowUp, 'company_id' | 'task' | 'due_on', Managed | 'completed_at'>
export type CompanyUpdate = Partial<CompanyInsert>
export type ContactUpdate = Partial<ContactInsert>
export type SemesterUpdate = Partial<SemesterInsert>
export type SponsorshipRequestUpdate = Partial<SponsorshipRequestInsert>
export type FollowUpUpdate = Partial<FollowUpInsert>
export type { Database } from './database'
