import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-medium">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">This screen is not built yet.</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<Placeholder title="Companies" />} />
        <Route path="pipeline" element={<Placeholder title="Pipeline" />} />
        <Route path="partnerships" element={<Placeholder title="Partnerships" />} />
        <Route path="follow-ups" element={<Placeholder title="Follow-ups" />} />
        <Route path="activity" element={<Placeholder title="Activity" />} />
        <Route path="members" element={<Placeholder title="Members" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  )
}