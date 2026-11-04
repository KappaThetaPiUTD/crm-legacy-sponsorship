import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Pencil, Trash2, Building2, Search } from 'lucide-react'
import { createCompany, deleteCompany, listCompanies, updateCompany, type CompanyRecord, type SponsorStatus, type SponsorTier } from '../lib/companies'
import { getCurrentProfile } from '../lib/auth'
import { canEditCompanies, canDeleteCompanies } from '../lib/permissions'

const emptyForm: {
  name: string
  industry: string
  contact_name: string
  contact_email: string
  contact_phone: string
  tier: SponsorTier
  notes: string
  status: SponsorStatus
} = {
  name: '',
  industry: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  tier: 'unknown',
  notes: '',
  status: 'prospect',
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      const [companyList, profile] = await Promise.all([listCompanies(), getCurrentProfile()])
      setCompanies(companyList)
      setRole(profile?.role ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load companies.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const canEdit = canEditCompanies(role as any)
  const canDelete = canDeleteCompanies(role as any)

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return companies

    return companies.filter((company) => {
      const searchable = [
        company.name,
        company.industry,
        company.contact_name,
        company.contact_email,
        company.contact_phone,
        company.status,
        company.tier,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalized)
    })
  }, [companies, query])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!canEdit) {
        throw new Error('You do not have permission to edit company records.')
      }

      if (editingId) {
        await updateCompany(editingId, {
          name: form.name,
          industry: form.industry || null,
          contact_name: form.contact_name || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          tier: form.tier,
          notes: form.notes || null,
          status: form.status,
        })
      } else {
        await createCompany({
          name: form.name,
          industry: form.industry || null,
          contact_name: form.contact_name || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          tier: form.tier,
          notes: form.notes || null,
          status: form.status,
        })
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadData()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save company.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(company: CompanyRecord) {
    if (!canEdit) return
    setEditingId(company.id)
    setForm({
      name: company.name,
      industry: company.industry ?? '',
      contact_name: company.contact_name ?? '',
      contact_email: company.contact_email ?? '',
      contact_phone: company.contact_phone ?? '',
      tier: company.tier,
      notes: company.notes ?? '',
      status: company.status,
    })
  }

  async function handleDelete(id: string) {
    if (!canDelete) return

    try {
      await deleteCompany(id)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete company.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-green-700">COMPANIES</p>
          <h1 className="mt-2 text-3xl font-medium text-slate-900">Sponsor directory</h1>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
            }}
            className="flex items-center gap-2 rounded-lg bg-[#0b1510] px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            <Plus size={16} /> Add company
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search companies"
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No companies found.</div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                      {company.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{company.name}</p>
                      <p className="text-xs text-slate-500">{company.industry ?? 'No industry listed'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700 uppercase">
                      {company.tier}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 uppercase">
                      {company.status}
                    </span>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleEdit(company)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        aria-label={`Edit ${company.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(company.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Delete ${company.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-green-700" />
            <h2 className="text-lg font-medium text-slate-900">
              {editingId ? 'Edit company' : 'New company'}
            </h2>
          </div>

          {!canEdit ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              You do not have permission to edit sponsor records.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Company name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Industry</label>
                <input
                  value={form.industry}
                  onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Contact name</label>
                <input
                  value={form.contact_name}
                  onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Phone</label>
                <input
                  value={form.contact_phone}
                  onChange={(event) => setForm((current) => ({ ...current, contact_phone: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(event) => setForm((current) => ({ ...current, tier: event.target.value as typeof form.tier }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as typeof form.status }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_talks">In talks</option>
                    <option value="committed">Committed</option>
                    <option value="received">Received</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Saving...' : editingId ? 'Update company' : 'Create company'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}
