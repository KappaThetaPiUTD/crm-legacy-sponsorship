import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import CompaniesPage from './pages/CompaniesPage'

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
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<CompaniesPage />} />
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