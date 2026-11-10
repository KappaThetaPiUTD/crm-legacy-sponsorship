import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const migration = await readFile(new URL('../supabase/migrations/20261108000100_shared_model.sql', import.meta.url), 'utf8')
const legacy = await readFile(new URL('./legacy-schema.sql', import.meta.url), 'utf8')
// Test-only Supabase Auth boundary. No external account or database is used.
const authStub = `
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
`
let db: PGlite
let company: string, semester: string
before(async () => {
  db = new PGlite()
  await db.exec(authStub + legacy)
  await db.exec(migration)
  company = (await db.query<{id:string}>("insert into companies(name) values ('Test sponsor') returning id")).rows[0].id
  semester = (await db.query<{id:string}>("insert into semesters(name,starts_on,ends_on,fundraising_goal) values ('Spring 2026','2026-01-01','2026-05-31',20000) returning id")).rows[0].id
})
after(async () => { await db?.close() })

test('all five shared tables exist with UUID primary keys', async () => {
  const { rows } = await db.query<{table_name:string}>(`select table_name from information_schema.columns where table_schema='public' and column_name='id' and data_type='uuid' and table_name in ('companies','contacts','semesters','sponsorship_requests','follow_ups')`)
  assert.equal(rows.length, 5)
})

test('company name is required and cannot be blank', async () => {
  await assert.rejects(db.exec('insert into companies default values'), /null/)
  await assert.rejects(db.exec("insert into companies(name) values ('   ')"), /check/)
})

test('request defaults match the TypeScript contract', async () => {
  const { rows } = await db.query<{stage:string; amount:string; tier:string; owner_id:string|null}>(
    'insert into sponsorship_requests(company_id,semester_id) values ($1,$2) returning *', [company, semester])
  assert.equal(rows[0].stage, 'prospect')
  assert.equal(Number(rows[0].amount), 0)
  assert.equal(rows[0].tier, 'unknown')
  assert.equal(rows[0].owner_id, null)
})

test('request requires both company and semester', async () => {
  await assert.rejects(db.query('insert into sponsorship_requests(company_id) values ($1)', [company]), /null/)
  await assert.rejects(db.query('insert into sponsorship_requests(semester_id) values ($1)', [semester]), /null/)
})

test('request accepts exactly the five agreed pipeline stages', async () => {
  const { rows } = await db.query<{stage:string}>("select unnest(enum_range(null::pipeline_stage))::text as stage")
  assert.deepEqual(rows.map(r => r.stage), ['prospect','contacted','in_talks','committed','received'])
  await assert.rejects(db.query("insert into sponsorship_requests(company_id,semester_id,stage) values ($1,$2,'in-talk')", [company, semester]), /enum/)
})

test('money rejects negative, NaN and overflow values', async () => {
  for (const amount of ['-0.01','NaN','10000000000']) {
    await assert.rejects(db.query('insert into sponsorship_requests(company_id,semester_id,amount) values ($1,$2,$3)', [company, semester, amount]))
  }
  await assert.rejects(db.exec("insert into semesters(name,starts_on,ends_on,fundraising_goal) values ('Bad money','2026-01-01','2026-02-01',-1)"), /check/)
})

test('money has exact two-decimal database arithmetic', async () => {
  const { rows } = await db.query<{total:string}>("select (0.10::numeric(12,2)+0.20::numeric(12,2))::text as total")
  assert.equal(rows[0].total, '0.30')
})

test('foreign keys reject orphan records', async () => {
  const absent = '00000000-0000-0000-0000-000000000099'
  await assert.rejects(db.query("insert into contacts(company_id,name) values ($1,'Person')", [absent]), /foreign key/)
  await assert.rejects(db.query('insert into sponsorship_requests(company_id,semester_id) values ($1,$2)', [company, absent]), /foreign key/)
  await assert.rejects(db.query("insert into follow_ups(company_id,task,due_on) values ($1,'Call','2026-04-01')", [absent]), /foreign key/)
})

test('semesters reject reversed and impossible dates and duplicate names', async () => {
  await assert.rejects(db.exec("insert into semesters(name,starts_on,ends_on) values ('Reversed','2026-05-01','2026-01-01')"), /check/)
  await assert.rejects(db.exec("insert into semesters(name,starts_on,ends_on) values ('Invalid','2026-02-30','2026-05-01')"))
  await assert.rejects(db.exec("insert into semesters(name,starts_on,ends_on) values ('Spring 2026','2026-01-01','2026-05-31')"), /unique/)
})

test('company can have several contacts and requests in the same semester', async () => {
  await db.query("insert into contacts(company_id,name) values ($1,'A'),($1,'B')", [company])
  await db.query('insert into sponsorship_requests(company_id,semester_id) values ($1,$2),($1,$2)', [company, semester])
  const { rows } = await db.query<{n:number}>('select count(*)::int as n from contacts where company_id=$1', [company])
  assert.equal(rows[0].n, 2)
})

test('history prevents accidental deletion of a linked company or semester', async () => {
  await assert.rejects(db.query('delete from companies where id=$1', [company]), /foreign key/)
  await assert.rejects(db.query('delete from semesters where id=$1', [semester]), /foreign key/)
})

test('archiving a company retains its linked history', async () => {
  await db.query('update companies set archived_at=now() where id=$1', [company])
  const { rows } = await db.query<{n:number}>('select count(*)::int as n from contacts where company_id=$1', [company])
  assert.equal(rows[0].n, 2)
})

test('completion sets a timestamp, repeated completion preserves it, reopening clears it', async () => {
  const inserted = await db.query<{id:string;done:boolean;completed_at:null}>("insert into follow_ups(company_id,task,due_on) values ($1,'Email sponsor','2026-04-01') returning *", [company])
  const id = inserted.rows[0].id
  assert.equal(inserted.rows[0].done, false)
  assert.equal(inserted.rows[0].completed_at, null)
  const a = await db.query<{ts:string}>('update follow_ups set done=true where id=$1 returning completed_at::text as ts', [id])
  const b = await db.query<{ts:string}>('update follow_ups set done=true where id=$1 returning completed_at::text as ts', [id])
  assert.ok(a.rows[0].ts)
  assert.equal(a.rows[0].ts, b.rows[0].ts)
  const c = await db.query<{completed_at:null}>('update follow_ups set done=false where id=$1 returning completed_at', [id])
  assert.equal(c.rows[0].completed_at, null)
})

test('follow-up task and due date are required', async () => {
  await assert.rejects(db.query("insert into follow_ups(company_id,task) values ($1,'Email')", [company]), /null/)
  await assert.rejects(db.query("insert into follow_ups(company_id,task,due_on) values ($1,' ','2026-04-01')", [company]), /check/)
})

test('deleting a member clears assignments without deleting sponsor history', async () => {
  const member = '00000000-0000-0000-0000-000000000123'
  await db.query("insert into auth.users(id,email) values ($1,'test@example.com')", [member])
  const req = await db.query<{id:string}>('insert into sponsorship_requests(company_id,semester_id,owner_id) values ($1,$2,$3) returning id', [company,semester,member])
  const task = await db.query<{id:string}>("insert into follow_ups(company_id,task,due_on,assignee_id) values ($1,'Call','2026-04-01',$2) returning id", [company,member])
  await db.query('delete from public.profiles where id=$1',[member])
  assert.equal((await db.query<{owner_id:null}>('select owner_id from sponsorship_requests where id=$1',[req.rows[0].id])).rows[0].owner_id,null)
  assert.equal((await db.query<{assignee_id:null}>('select assignee_id from follow_ups where id=$1',[task.rows[0].id])).rows[0].assignee_id,null)
})

test('new tables remain closed until Rishith supplies grants and membership policies', async () => {
  for (const table of ['contacts','semesters','sponsorship_requests','follow_ups']) {
    const { rows } = await db.query<{rls:boolean; can_read:boolean}>("select relrowsecurity as rls, has_table_privilege('authenticated',oid,'SELECT') as can_read from pg_class where oid=$1::regclass", [table])
    assert.equal(rows[0].rls, true)
    assert.equal(rows[0].can_read, false)
  }
})

test('upgrade preserves Rishith data and policies and copies the legacy contact', async () => {
  const upgrade = new PGlite()
  try {
    await upgrade.exec(authStub + legacy)
    await upgrade.exec("insert into companies(name,contact_name,contact_email,status) values ('Existing sponsor','Alex','alex@example.com','committed')")
    const beforePolicies = await upgrade.query('select tablename, policyname, qual, with_check from pg_policies order by tablename,policyname')
    await upgrade.exec(migration)
    const afterPolicies = await upgrade.query('select tablename, policyname, qual, with_check from pg_policies order by tablename,policyname')
    assert.deepEqual(afterPolicies.rows,beforePolicies.rows)
    const { rows } = await upgrade.query<{name:string;email:string}>('select name,email from contacts')
    assert.deepEqual(rows,[{name:'Alex',email:'alex@example.com'}])
    assert.equal((await upgrade.query<{n:number}>('select count(*)::int as n from sponsorship_requests')).rows[0].n,0)
    assert.equal((await upgrade.query<{status:string}>('select status from companies')).rows[0].status,'committed')
  } finally { await upgrade.close() }
})

test('missing backend prerequisite fails before creating CRM tables', async () => {
  const empty = new PGlite()
  try {
    await empty.exec(authStub)
    await assert.rejects(empty.exec(migration), /profiles\/auth schema first/)
    await empty.exec('rollback')
    assert.equal((await empty.query<{table_name:string|null}>("select to_regclass('public.companies')::text as table_name")).rows[0].table_name,null)
  } finally { await empty.close() }
})
