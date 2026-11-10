# Mith's handoff: shared types and database schema

Your assigned work is the shared TypeScript model and database design. This handoff implements those pieces and checks them locally. It does not implement Rishith's Supabase setup/auth/seeding, Avinash's dashboard integration, or the frontend teammates' changes.

## What to open first

| File | Purpose |
| --- | --- |
| `src/types/index.ts` | Company, Contact, SponsorshipRequest, FollowUp, Semester and Member; required insert fields and the five pipeline stages. |
| `src/types/database.ts` | A typed table contract Rishith can use with his Supabase client. No client is created here. |
| `supabase/migrations/20261108000100_shared_model.sql` | Tables, relationships, constraints, indexes, timestamps, and a compatible upgrade from the initial backend schema. |
| `docs/SCHEMA.md` | Field-by-field database design and decisions. |
| `docs/MITH_EXPLAINER.md` | Your presentation script, examples and likely questions. |
| `tests/schema.test.ts` | SQL tests running locally in PGlite, with a minimal simulated Supabase Auth boundary. |

## Run the supplied project on Windows

1. Extract `Evergreen_Mith_Backend.zip` using **Extract All**. Work in the extracted folder, not inside the ZIP viewer.
2. In VS Code, choose **File > Open Folder** and select its `project` folder. Open **Terminal > New Terminal**. The terminal should already be in that folder.
3. If changing folders manually, quote paths containing spaces:

```powershell
cd "C:\Users\Minnu\KTP CRM Project"
```

Use the real location shown by File Explorer. That example only works if the folder is directly inside `C:\Users\Minnu`.

4. Use a current Node.js LTS release supported by Vite. Check that Node and npm work, then install and verify:

```powershell
node --version
npm --version
npm ci
npm run check
npm run dev
```

Open the local URL printed by Vite. The existing dashboard still uses mock data. Your types and schema do not change the screens. If PowerShell blocks `npm.ps1`, use `npm.cmd ci`, `npm.cmd run check`, and `npm.cmd run dev`.

`npm run check` runs the app build, lint, strict type checks and the schema tests. Tests use an isolated local database; you do not need Supabase credentials to run them. You can stop the dev server with Ctrl+C.

## Put only your changes on GitHub

The ZIP's `project` folder is a runnable snapshot without Git history. The included `mith-backend.patch` contains just your changes relative to repository main at commit `a1ef1534922b9a974b5303d3063a66e324e45a60`.

For a team pull request, clone the repository into a **new folder**, make your branch, and apply the patch. Do not overwrite a folder with teammates' uncommitted work.

```powershell
git clone https://github.com/KappaThetaPiUTD/crm-legacy-sponsorship.git
cd crm-legacy-sponsorship
git switch -c mith/shared-types-schema
```

Copy `mith-backend.patch` from the extracted ZIP into this cloned folder, then run:

```powershell
git apply --check mith-backend.patch
git apply mith-backend.patch
Remove-Item mith-backend.patch
npm ci
npm run check
git status
```

If `git apply --check` fails, stop before applying: main changed and the patch needs reconciliation. Do not force it. GitHub sign-in can be completed through VS Code when publishing the branch. You need repository write access, or a fork if the team requires one.

The PM requested small PRs. Publish the shared contract first:

```powershell
git add src/types
git commit -m "Define shared CRM TypeScript types"
git push -u origin mith/shared-types-schema
```

Open a PR from that branch to main. Add the schema and its checks in a second PR after the first is merged (or use a stacked PR with the first branch as its base). Keep the remaining local files; do not delete them when changing branches. An easy sequence while the first PR is pending:

```powershell
git switch -c mith/database-schema
git add supabase/migrations docs tests tsconfig.tests.json package.json package-lock.json
git commit -m "Define and verify the CRM database schema"
git push -u origin mith/database-schema
```

For the second PR, select `mith/shared-types-schema` as its base until that first PR merges. After merging the first, change the second PR's base to main and check the diff. No commit, push or merge has been made to the remote repository by this handoff.

## Hand the schema to Rishith

Your task is to deliver and explain the schema. Rishith applies it to the team's development Supabase project, after reviewing it and backing up any existing project data.

1. Rishith's initial `public.profiles`/auth schema must exist first. The migration deliberately stops if `profiles` is missing, rather than inventing a different authentication setup.
2. Apply the migration once through the team's migration workflow. It uses one transaction. Do not rerun it manually after a successful application.
3. Review the copied contacts. Existing single-contact fields are preserved and copied into the new contacts table. Company status does not automatically become a request: no historical amount or semester is invented.
4. Rishith adds member-only grants and row-level security policies, then seeds approved demo data. The new tables are deliberately closed to browser roles until that work is done.
5. Avinash connects queries and saves to the UI. Andrew uses the shared types for Companies mock data.

**Security handoff:** The inspected initial backend lets any signed-in account read companies. Login alone does not prove KTP membership. This handoff preserves that teammate-owned policy; Rishith must enforce membership before using real sponsor data. This is an integration requirement, not a claim that auth is finished.

## What is still needed

- Rishith's confirmation of the final profile/membership model and when the schema is applied.
- Teammates' updated feature status for their presentation sections.
- A working app/demo URL or a recording for the presentation when available.
- Figma is optional for your types/schema work. It helps only if screens have fields absent from the supplied PDFs/repository.

Do not send passwords, database passwords, service-role keys or secret keys. None is needed for your local work or the presentation.

## Validation limits

Local build, lint, type checking and schema tests were run on the supplied snapshot. These checks cover database structure, constraints, data preservation and completion timestamps. They do not certify hosted Supabase Auth, browser queries, teammates' unmerged work, or a deployed app. No software can honestly be guaranteed to have zero errors in every environment.
