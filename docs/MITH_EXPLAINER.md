# What you built and how to present it

## Your 60–90 second script (slide 9)

“My responsibility is the shared TypeScript types and database schema. I defined Company, Contact, SponsorshipRequest, FollowUp and Semester so everyone uses the same names and required fields.

The company is the central record. One company can have several contacts and sponsorship requests over different semesters. Each related record stores a company_id, which is a foreign key pointing to a real company. This keeps sponsor history available when officers change.

Stage and amount belong to each request because the same company can give different amounts each semester. The stage allows only five values, from prospect to received. The database uses exact decimal amounts and rejects negative money, missing relationships and invalid semester dates.

I also kept compatibility with Rishith's initial company schema, preserved its existing fields, and added tests for the upgrade and the main constraints. The new tables stay closed to browser access until Rishith adds the member policies.

My handoff is the shared types, SQL migration and schema documentation. Rishith handles Supabase setup, authentication and seeding, and Avinash connects the dashboard.”

Practice that explanation while looking at the files. Only claim what you understand and can demonstrate. The SQL was tested locally; no hosted database migration or deployment has been performed.

## File tour

| File | What you should be able to point to |
| --- | --- |
| src/types/index.ts | The five interfaces, five stage values, and required Insert fields |
| src/types/database.ts | The mapping from table names to Row/Insert/Update types for a future typed Supabase client |
| supabase/migrations/20261108000100_shared_model.sql | CREATE TABLE, REFERENCES, NOT NULL, CHECK, indexes and completion timestamp trigger |
| tests/schema.test.ts | Examples proving bad records fail and existing data survives the upgrade |
| docs/SCHEMA.md | All fields, relationships, defaults and the boundary with auth/integration |

## Words to know

**Type/interface:** the expected shape of a value in TypeScript. **Table:** records of one kind. **Row:** one record. **Primary key:** its unique ID. **Foreign key:** an ID pointing to a real row in another table. **One-to-many:** a company can have several contacts. **Enum:** a fixed set of allowed values. **Nullable:** a field may be empty. **Constraint:** a database-enforced rule. **Migration:** a versioned change to the database. **RLS:** database rules limiting which rows a user can access; Rishith owns the membership rules.

## Questions you may get

**Why separate companies and contacts?** One company may have several people. A separate contact table represents that without duplicating the company. The old single-contact columns remain temporarily for compatibility; new features use the contacts table.

**Why does a request have a semester?** A 2025 donation and a 2026 request are different records. Keeping both preserves history and supports per-term reporting.

**Why does stage belong to the request?** A company may already have donated last semester while this semester's request is only a prospect. One company-wide stage cannot represent both.

**Are TypeScript checks enough?** No. They catch developer mistakes before runtime. SQL constraints also reject invalid data regardless of which client sends it.

**What happens when an officer leaves?** Sponsor history stays with the company. Requests/tasks can be reassigned; deleting a member profile clears those optional assignments. Access revocation is Rishith's auth responsibility.

**How does checking a task work in your schema?** The stored row has done and completed_at. A database trigger sets the timestamp on completion and clears it on reopening. Avinash still needs to connect the checkbox to a save call. This handoff does not make the current dashboard checkbox persist.

**Why decimal money?** PostgreSQL numeric(12,2) stores exact cents for database arithmetic. The amounts currently mean USD. JavaScript numbers still need care at the API boundary.

**Did you build authentication or deploy Supabase?** No. My assignment is types and schema. Rishith owns setup, membership policies and seeding. My new tables stay closed until he adds reviewed access rules.

**What did you test?** App build, lint, strict type checks, and local SQL tests for valid/invalid records, relationships, dates, money, deletion protection, completion timestamps and upgrading the initial schema. The test database simulates the Auth boundary; these are not hosted login or UI tests.

**Is the entire app finished?** No. My deliverable is ready for review and integration. The main dashboard still uses mock data. Other team members own its integration and UI fixes.

## A simple example

Company: Example Sponsor. Contact: Alex, linked by company_id. Semester: Spring 2026. Request: $2,500 at committed, linked to that company and semester. Follow-up: “Confirm payment date,” due April 20, linked to the company and optionally assigned to a member. Next semester creates another request; it does not overwrite this one.

## Your local demonstration

Run `npm run check` and show the pass result. Open the interfaces, then the matching SQL columns. Point to company_id REFERENCES companies(id), the five stage values, and numeric(12,2). Explain one rejected invalid record from tests. That demonstrates your work without pretending the team's hosted app is already connected.
