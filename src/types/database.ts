/** Schema contract for the Supabase JS client. Reviewed against the shared-model migration.
 * After deployment, Rishith can compare this to `supabase gen types typescript`.
 */
import type {
  Member, Company, Contact, Semester, SponsorshipRequest, FollowUp,
  CompanyInsert, CompanyUpdate, ContactInsert, ContactUpdate,
  SemesterInsert, SemesterUpdate, SponsorshipRequestInsert,
  SponsorshipRequestUpdate, FollowUpInsert, FollowUpUpdate,
  PipelineStage, SponsorTier,
} from './index'

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}
type Table<Row, Insert, Update> = {
  Row: { [K in keyof Row]: Row[K] }
  Insert: Insert
  Update: Update
  Relationships: Relationship[]
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<Member, never, never>
      companies: Table<Company, CompanyInsert, CompanyUpdate>
      contacts: Table<Contact, ContactInsert, ContactUpdate>
      semesters: Table<Semester, SemesterInsert, SemesterUpdate>
      sponsorship_requests: Table<SponsorshipRequest, SponsorshipRequestInsert, SponsorshipRequestUpdate>
      follow_ups: Table<FollowUp, FollowUpInsert, FollowUpUpdate>
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { pipeline_stage: PipelineStage; sponsor_tier: SponsorTier }
    CompositeTypes: { [_ in never]: never }
  }
}
