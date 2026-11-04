import { NavLink, Outlet } from 'react-router-dom'
import {
  Home, Building2, GitBranch, Sparkles, CheckCircle2, History,
  Users, Settings, Bell, HelpCircle, ChevronDown, Leaf,
} from 'lucide-react'
import { org, user, navCounts } from '../data/mock'

const workspace = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/pipeline', label: 'Pipeline', icon: GitBranch, count: navCounts.pipeline },
  { to: '/partnerships', label: 'Partnerships', icon: Sparkles, count: navCounts.partnerships },
  { to: '/follow-ups', label: 'Follow-ups', icon: CheckCircle2, count: navCounts.followUps },
  { to: '/activity', label: 'Activity', icon: History },
]

const organization = [
  { to: '/members', label: 'Members', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, label, icon: Icon, count }: { to: string; label: string; icon: typeof Home; count?: number }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-[#16301f] text-white border-l-2 border-green-500'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{count}</span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-[#0b1510] px-4 py-6">
        <div className="mb-6 flex items-center gap-2 px-2 text-white">
          <Leaf className="text-green-500" size={26} />
          <span className="text-xl font-semibold">Evergreen</span>
        </div>

        <button className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-xs font-bold text-white">
            {org.initials}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-white">{org.name}</span>
            <span className="block text-xs text-slate-400">{org.type}</span>
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        <p className="mb-2 px-3 text-xs font-medium tracking-wider text-slate-500">WORKSPACE</p>
        <nav className="mb-6 flex flex-col gap-1">
          {workspace.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        <p className="mb-2 px-3 text-xs font-medium tracking-wider text-slate-500">ORGANIZATION</p>
        <nav className="flex flex-col gap-1">
          {organization.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-900/60 text-green-400">
              <Sparkles size={16} />
            </span>
            <p className="text-sm font-semibold text-white">Need a head start?</p>
            <p className="mt-1 text-xs text-slate-400">Generate a personalized sponsor email in seconds.</p>
            <button className="mt-3 text-xs font-medium text-green-400 hover:text-green-300">Draft with AI</button>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {user.initials}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-white">{user.name}</span>
              <span className="block text-xs text-slate-400">{user.role}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b border-slate-200 px-8">
          <button aria-label="Notifications" className="text-slate-500 hover:text-slate-900"><Bell size={20} /></button>
          <button aria-label="Help" className="text-slate-500 hover:text-slate-900"><HelpCircle size={20} /></button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}