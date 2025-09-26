import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'

export default function AdminRoute() {
  const profile = useAppSelector((s: RootState) => s.user.profile)
  if (!profile || profile.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
