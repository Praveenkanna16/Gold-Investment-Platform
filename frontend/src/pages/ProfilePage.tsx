import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Crown, 
  Edit3, 
  Save, 
  Camera,
  Award,
  TrendingUp,
  Wallet,
  Star,
  Settings,
  Bell,
  Lock
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { fetchMe, updateProfile } from '../store/slices/userSlice'
import { fetchBalance } from '../store/slices/goldSlice'
import { fetchTransactions } from '../store/slices/transactionsSlice'
import toast from 'react-hot-toast'
import { usePolling } from '../utils/usePolling'
import type { RootState } from '../store'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const profile = useAppSelector((s: RootState) => s.user.profile)
  const balance = useAppSelector((s: RootState) => s.gold.balance)
  const transactions = useAppSelector((s: RootState) => s.transactions.items)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchMe())
    dispatch(fetchBalance())
    dispatch(fetchTransactions())
  }, [dispatch])

  // Live polling
  usePolling(() => dispatch(fetchBalance()), { intervalMs: 15000, immediate: false })
  usePolling(() => dispatch(fetchTransactions()), { intervalMs: 15000, immediate: false })
  usePolling(() => dispatch(fetchMe()), { intervalMs: 60000, immediate: false })

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await dispatch(updateProfile({ firstName, lastName, phone }))
    if ((res as any).error) {
      toast.error((res as any).payload || 'Failed to update')
    } else {
      toast.success('✨ Profile updated successfully!')
      setIsEditing(false)
    }
    setLoading(false)
  }

  // Only this user's transactions
  const uid = profile?.id ? String(profile.id) : undefined
  const userTxs = uid
    ? transactions.filter((tx: any) => {
        const tid = tx.userId ? String(tx.userId) : undefined
        const nestedId = tx.user?.id ? String(tx.user.id) : undefined
        return tid === uid || nestedId === uid
      })
    : []

  // A tx is verified only if completed AND has real gateway metadata
  const isVerified = (tx: any) => {
    if (tx?.status !== 'completed') return false
    if (tx?.paymentVerified === true) return true
    const pid = String(tx?.paymentId || '')
    const oid = String(tx?.orderId || '')
    return pid.startsWith('pay_') && oid.startsWith('order_')
  }

  const verifiedTxs = userTxs.filter(isVerified)

  const totalInvested = verifiedTxs
    .filter((tx: any) => tx.type === 'buy')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0)

  // Compute gold balance purely from verified transactions
  const totalGoldBought = verifiedTxs
    .filter((tx: any) => tx.type === 'buy')
    .reduce((sum: number, tx: any) => sum + Number(tx.goldQuantity || 0), 0)
  const totalGoldSold = verifiedTxs
    .filter((tx: any) => tx.type === 'sell')
    .reduce((sum: number, tx: any) => sum + Number(tx.goldQuantity || 0), 0)
  const goldBalanceFromTxs = Number((totalGoldBought - totalGoldSold).toFixed(4))
  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString() : ''

  const stats = [
    {
      title: 'Gold Balance',
      value: goldBalanceFromTxs,
      unit: 'grams',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      title: 'Total Invested',
      value: totalInvested,
      unit: 'INR',
      icon: TrendingUp,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Transactions',
      value: verifiedTxs.length,
      unit: 'completed',
      icon: Award,
      color: 'from-blue-400 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              My Profile
            </h1>
          </div>
          <p className="text-gray-600">Manage your account and investment preferences</p>
        </motion.div>

        {!profile ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-white rounded-full p-2 shadow-lg border border-gray-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </motion.button>
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-500 mb-2">{profile.email}</p>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  profile.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {profile.role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                  {profile.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </div>

                {/* Member Since */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Member since {joinDate}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl transition-all duration-300"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl transition-all duration-300"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Security</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Investment Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {stat.unit === 'INR' ? `₹${stat.value.toLocaleString()}` : 
                               stat.unit === 'grams' ? `${stat.value.toFixed(4)}` : 
                               stat.value}
                            </span>
                            <span className="text-gray-500 text-sm">{stat.unit}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Profile Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </motion.button>
                </div>

                <form onSubmit={onSave} className="space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 ${
                            isEditing 
                              ? 'focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 ${
                            isEditing 
                              ? 'focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 ${
                          isEditing 
                            ? 'focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
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
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
