import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  Crown, 
  TrendingUp, 
  Wallet, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Sparkles
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { logout } from '../store/slices/authSlice'

const Navbar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken)
  const profile = useAppSelector((state: RootState) => state.user.profile)
  const settings = useAppSelector((state: RootState) => state.settings.settings)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const features = settings?.features || { buy: true, sell: true, sip: true, admin: true }
  const navItems = [
    { path: '/', label: 'Dashboard', icon: TrendingUp, show: true },
    { path: '/buy', label: 'Buy Gold', icon: Crown, show: features.buy },
    { path: '/sip', label: 'SIP', icon: Wallet, show: features.sip },
    { path: '/transactions', label: 'Transactions', icon: History, show: true },
    { path: '/profile', label: 'Profile', icon: User, show: true },
    ...(profile?.role === 'admin' && features.admin ? [
      { path: '/admin', label: 'Admin', icon: Shield, show: true },
      { path: '/admin/access', label: 'Access', icon: Settings, show: true },
      { path: '/admin/sip', label: 'Admin SIP', icon: Sparkles, show: true },
    ] : [])
  ].filter((i: any) => i.show)

  const isActivePath = (path: string) => location.pathname === path

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl backdrop-blur-lg border-b border-yellow-300/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Crown className="h-10 w-10 text-white" />
                <Sparkles className="h-4 w-4 text-yellow-200 absolute -top-1 -right-1" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">GoldVault</h1>
                <p className="text-xs text-yellow-100">Premium Investment Platform</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {accessToken && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)
                return (
                  <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={item.path}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-yellow-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white/20 rounded-xl border border-white/30"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {accessToken ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <motion.div 
                  className="hidden sm:flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-yellow-800" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{profile?.firstName}</p>
                    <p className="text-yellow-100 text-xs">{profile?.role}</p>
                  </div>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                  className="md:hidden p-2 rounded-xl bg-white/10 text-white"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-yellow-100 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-white text-yellow-600 hover:bg-yellow-50 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && accessToken && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-yellow-300/20"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.path)
                  return (
                    <motion.div key={item.path} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-yellow-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
