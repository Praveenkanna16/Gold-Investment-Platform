import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Crown, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { login } from '../store/slices/authSlice'
import { fetchMe } from '../store/slices/userSlice'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((s: RootState) => s.auth)
  const [email, setEmail] = useState('admin@gold.com')
  const [password, setPassword] = useState('Admin1234')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await dispatch(login({ email, password }))
    if ((res as any).error) {
      toast.error((res as any).payload || 'Login failed')
    } else {
      await dispatch(fetchMe())
      toast.success('Welcome to GoldVault! 🎉')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4"
          >
            <Crown className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your GoldVault account</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8"
        >
          {/* Demo Credentials Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-blue-900">Demo Credentials</span>
            </div>
            <p className="text-sm text-blue-800">
              Admin: admin@gold.com / Admin1234<br />
              Or register a new account below
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors duration-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="bg-white/50 rounded-xl p-4">
            <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Secure</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Premium</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Trusted</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
