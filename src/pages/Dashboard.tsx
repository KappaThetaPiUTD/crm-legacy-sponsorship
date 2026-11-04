import { useState } from 'react'
import { Download, Plus, TrendingUp, CheckCircle2, GitBranch, FileText, Mail, Target, Clock, ArrowRight } from 'lucide-react'
import { semester, org, stats, followUps, pipeline, renewals, renewalTotal } from '../data/mock'

const usd = (n: number) => `$${n.toLocaleString()}`

const dueStyle = {
  today: 'bg-red-50 text-red-600',
  tomorrow: 'bg-amber-50 text-amber-700',
  later: 'bg-slate-100 text-slate-500',
}

function StatCard({ label, value, note, icon: Icon, tint }: {
  label: string; value: string; note: React.ReactNode; icon: typeof TrendingUp; tint: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}><Icon size={16} /></span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  )
}

function Card({ title, subtitle, action, children }: {
  title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between p-5 pb-3">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

const linkClass = 'flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800'

export default function Dashboard() {
  const [done, setDone] = useState<string[]>([])
  const toggle = (id: string) =>
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))

  const gap = stats.goal - stats.received - stats.awaiting
  const receivedPct = (stats.received / stats.goal) * 100
  const awaitingPct = (stats.awaiting / stats.goal) * 100
  const potential = pipeline.reduce((sum, s) => sum + s.amount, 0)
  const requestCount = pipeline.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {semester.toUpperCase()} SEMESTER
          </p>
          <h1 className="text-3xl font-medium">Good morning, {org.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening with your sponsorships today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium hover:bg-slate-50">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#0b1510] px-4 py-2 text-xs font-medium text-white hover:bg-black">
            <Plus size={14} /> Add company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Received this semester" value={usd(stats.received)} icon={TrendingUp} tint="bg-green-50 text-green-600"
          note={<><span className="font-medium text-green-700">↑ {stats.receivedChange}%</span> from Fall 2025</>} />
        <StatCard label="Committed" value={usd(stats.committed)} icon={CheckCircle2} tint="bg-violet-50 text-violet-600"
          note={`${usd(stats.awaiting)} awaiting payment`} />
        <StatCard label="Active requests" value={String(stats.activeRequests)} icon={GitBranch} tint="bg-orange-50 text-orange-600"
          note={`${stats.movedThisWeek} moved forward this week`} />
        <StatCard label="All-time raised" value={usd(stats.allTime)} icon={FileText} tint="bg-blue-50 text-blue-600"
          note={`Across ${stats.sponsorCount} sponsors`} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <Card title="Fundraising goal" subtitle={`${semester} progress`}>
            <div className="px-5 pb-5">
              <p className="text-2xl font-semibold">
                {usd(stats.received)} <span className="text-xs font-normal text-slate-500">of {usd(stats.goal)}</span>
              </p>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="bg-green-600" style={{ width: `${receivedPct}%` }} />
                <div className="bg-amber-500" style={{ width: `${awaitingPct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Received', value: stats.received, dot: 'bg-green-600' },
                  { label: 'Awaiting', value: stats.awaiting, dot: 'bg-amber-500' },
                  { label: 'Gap to goal', value: gap, dot: 'bg-slate-300' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-slate-200 p-2.5">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className={`h-1.5 w-1.5 rounded-sm ${s.dot}`} />{s.label}
                    </p>
                    <p className="mt-1 text-xs font-semibold">{usd(s.value)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-700"><Target size={16} /></span>
                <div>
                  <p className="text-xs font-semibold">You're on track</p>
                  <p className="text-[11px] text-slate-500">At this pace, you'll reach your goal by May 2.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-span-3">
          <Card title="My follow-ups" subtitle="Stay ahead of your relationships"
            action={<a href="/follow-ups" className={linkClass}>View all <ArrowRight size={12} /></a>}>
            <ul className="border-t border-slate-100">
              {followUps.map((f) => (
                <li key={f.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-0">
                  <input type="checkbox" checked={done.includes(f.id)} onChange={() => toggle(f.id)}
                    className="h-4 w-4 rounded border-slate-300 accent-green-700" />
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">{f.initials}</span>
                  <div className={`flex-1 ${done.includes(f.id) ? 'opacity-50 line-through' : ''}`}>
                    <p className="text-xs font-semibold">{f.company}</p>
                    <p className="text-xs text-slate-500">{f.task}</p>
                  </div>
                  <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${dueStyle[f.tone]}`}>
                    <Clock size={11} /> {f.due}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <Card title="Pipeline overview" subtitle={`${requestCount} requests · ${usd(potential)} potential`}
            action={<a href="/pipeline" className={linkClass}>Open pipeline <ArrowRight size={12} /></a>}>
            <ul className="space-y-4 px-5 pb-6 pt-3">
              {pipeline.map((s) => (
                <li key={s.stage} className="flex items-center gap-3 text-xs">
                  <span className="flex w-24 items-center gap-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />{s.stage}
                  </span>
                  <span className="w-3 text-slate-400">{s.count}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <span className="block h-full rounded-full" style={{ width: `${(s.count / 6) * 100}%`, background: s.color }} />
                  </span>
                  <span className="w-16 text-right font-medium">{usd(s.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="col-span-2">
          <Card title="Renewal candidates" subtitle="Past sponsors not yet contacted"
            action={<span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">{renewalTotal}</span>}>
            <ul className="border-t border-slate-100">
              {renewals.map((r) => (
                <li key={r.company} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-semibold text-white">{r.initials}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{r.company}</p>
                    <p className="text-[11px] text-slate-500">Gave {usd(r.gave)} · {r.when}</p>
                  </div>
                  <button aria-label={`Email ${r.company}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                    <Mail size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <a href="/companies" className={`${linkClass} justify-center bg-slate-50 py-3`}>
              See all renewal candidates <ArrowRight size={12} />
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
