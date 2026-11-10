import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { CompanyInsert, FollowUpInsert, SponsorshipRequestInsert, PipelineStage } from '../src/types'

// Compiler assertions: these cases must remain errors. test:types checks them.
// @ts-expect-error A company requires a name.
const missingCompanyName: CompanyInsert = {}
// @ts-expect-error A follow-up requires a due date and company.
const missingTaskFields: FollowUpInsert = { task: 'Follow up' }
// @ts-expect-error A request must belong to a semester.
const missingSemester: SponsorshipRequestInsert = { company_id: 'id' }
// @ts-expect-error Free-text pipeline stages are not valid.
const typo: PipelineStage = 'in-talk'
void [missingCompanyName, missingTaskFields, missingSemester, typo]

test('request contract accepts the documented pipeline values', () => {
  const valid: SponsorshipRequestInsert = { company_id: 'company-id', semester_id: 'semester-id', stage: 'in_talks', amount: 2500 }
  assert.equal(valid.stage, 'in_talks')
})
