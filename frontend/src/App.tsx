import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import BuyGoldPage from './pages/BuyGoldPage'
import SIPPage from './pages/SIPPage'
import AdminAccessPage from './pages/AdminAccessPage'
import AdminSIPPage from './pages/AdminSIPPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import { useAppDispatch, useAppSelector } from './utils/hooks'
import { fetchSettings } from './store/slices/settingsSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings.settings)

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment')
    if (status === 'success') {
      toast.success('Payment successful! Your gold balance has been updated.')
    } else if (status === 'failed') {
      toast.error('Payment failed or cancelled. Please try again.')
    }
  }, [])

  const bannerClasses = settings?.banner?.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        settings?.banner?.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
                        settings?.banner?.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-blue-100 text-blue-800 border-blue-300'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {settings?.banner?.show && settings?.banner?.text && (
        <div className={`border-b ${bannerClasses}`}>
          <div className="container mx-auto max-w-6xl px-4 py-2 text-sm font-medium">
            {settings.banner.text}
          </div>
        </div>
      )}
      <main className="container mx-auto max-w-6xl px-4 py-6 flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/buy" element={<BuyGoldPage />} />
            <Route path="/sip" element={<SIPPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/access" element={<AdminAccessPage />} />
              <Route path="/admin/sip" element={<AdminSIPPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} Gold Investment Platform</footer>
      <Toaster position="top-right" />
    </div>
  )
}
