import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Wallet, 
  Crown, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import CountUp from 'react-countup'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { fetchMe } from '../store/slices/userSlice'
import { fetchPrice, fetchBalance } from '../store/slices/goldSlice'
import { fetchTransactions } from '../store/slices/transactionsSlice'
import { Link } from 'react-router-dom'
import { usePolling } from '../utils/usePolling'
import type { RootState } from '../store'
import SIPCard from '../components/SIPCard'
import AutoDipCard from '../components/AutoDipCard'
import ConverterCard from '../components/ConverterCard'
import TrustCenterCard from '../components/TrustCenterCard'
import { fetchSettings } from '../store/slices/settingsSlice'
import GoalProgressCard from '../components/GoalProgressCard'
import PriceAlertsCard from '../components/PriceAlertsCard'
import RewardsCard from '../components/RewardsCard'

 

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s: RootState) => s.user.profile)
  const price = useAppSelector((s: RootState) => s.gold.price)
  const balance = useAppSelector((s: RootState) => s.gold.balance)
  const priceHistory = useAppSelector((s: RootState) => s.gold.priceHistory)
  const transactions = useAppSelector((s: RootState) => s.transactions.items)

  useEffect(() => {
    dispatch(fetchMe())
    dispatch(fetchPrice())
    dispatch(fetchBalance())
    dispatch(fetchTransactions())
    dispatch(fetchSettings())
  }, [dispatch])

  // Live polling
  usePolling(() => dispatch(fetchPrice()), { intervalMs: 10000, immediate: true })
  usePolling(() => dispatch(fetchBalance()), { intervalMs: 15000, immediate: true })
  usePolling(() => dispatch(fetchTransactions()), { intervalMs: 15000, immediate: true })

  const currentPrice = Number(price?.pricePerGram ?? 0)

  // Derive user's gold balance strictly from verified transactions
  const uid = user?.id ? String(user.id) : undefined
  const userTxs = uid
    ? transactions.filter((tx: any) => {
        const tid = tx.userId ? String(tx.userId) : undefined
        const nestedId = tx.user?.id ? String(tx.user.id) : undefined
        return tid === uid || nestedId === uid
      })
    : []

  const isVerified = (tx: any) => {
    if (tx?.status !== 'completed') return false
    if (tx?.paymentVerified === true) return true
    const pid = String(tx?.paymentId || '')
    const oid = String(tx?.orderId || '')
    return pid.startsWith('pay_') && oid.startsWith('order_')
  }

  const verifiedTxs = userTxs.filter(isVerified)

  const totalGoldBought = verifiedTxs
    .filter((tx: any) => tx.type === 'buy')
    .reduce((sum: number, tx: any) => sum + Number(tx.goldQuantity || 0), 0)
  const totalGoldSold = verifiedTxs
    .filter((tx: any) => tx.type === 'sell')
    .reduce((sum: number, tx: any) => sum + Number(tx.goldQuantity || 0), 0)
  const goldBalance = Number((totalGoldBought - totalGoldSold).toFixed(4))
  const goldValue = goldBalance * currentPrice

  // Calculate real-time deltas from price history
  const lastPrice = priceHistory.length >= 1 ? priceHistory[priceHistory.length - 1].price : undefined
  const prevPrice = priceHistory.length >= 2 ? priceHistory[priceHistory.length - 2].price : undefined
  const firstPrice = priceHistory.length >= 1 ? priceHistory[0].price : undefined

  const priceChangePct = lastPrice && prevPrice ? Number((((lastPrice - prevPrice) / prevPrice) * 100).toFixed(2)) : 0
  const hasInvestments = goldBalance > 0
  const todaysProfit = hasInvestments && firstPrice && lastPrice ? goldBalance * (lastPrice - firstPrice) : 0
  const todaysProfitPct = firstPrice && lastPrice ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)) : 0

  const stats = [
    {
      title: 'Gold Balance',
      value: goldBalance,
      unit: 'grams',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600',
      change: '—',
      isPositive: true
    },
    {
      title: 'Portfolio Value',
      value: goldValue,
      unit: 'INR',
      icon: Wallet,
      color: 'from-green-400 to-green-600',
      change: hasInvestments ? `${priceChangePct >= 0 ? '+' : ''}${priceChangePct}%` : '0%',
      isPositive: priceChangePct >= 0
    },
    {
      title: 'Live Gold Price',
      value: currentPrice,
      unit: 'INR/gram',
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
      change: `${priceChangePct >= 0 ? '+' : ''}${priceChangePct}%`,
      isPositive: priceChangePct >= 0
    },
    {
      title: 'Today\'s Profit',
      value: todaysProfit,
      unit: 'INR',
      icon: Target,
      color: 'from-purple-400 to-purple-600',
      change: hasInvestments ? `${todaysProfitPct >= 0 ? '+' : ''}${todaysProfitPct}%` : '0%',
      isPositive: todaysProfit >= 0
    }
  ]

  // Portfolio data based on real investments
  const portfolioData = goldBalance > 0
    ? [
        { name: 'Gold Holdings', value: 100, color: '#FFD700' },
        { name: 'Available Cash', value: 0, color: '#10B981' },
      ]
    : [
        { name: 'Gold Holdings', value: 0, color: '#FFD700' },
        { name: 'Available Cash', value: 100, color: '#10B981' },
      ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'Investor'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Here's your investment overview for today</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl"
            >
              💰
            </motion.div>
          </div>
        </motion.div>

        {/* Action Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch"
        >
          <SIPCard />
          <AutoDipCard />
          <ConverterCard />
        </motion.div>

        {/* Trust Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <TrustCenterCard />
        </motion.div>

        {/* Goals, Alerts, Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch"
        >
          <GoalProgressCard />
          <PriceAlertsCard />
          <RewardsCard />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      stat.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        <CountUp
                          end={stat.value}
                          duration={2}
                          decimals={stat.unit === 'grams' ? 4 : (stat.unit === 'INR' ? 0 : 2)}
                          separator=","
                        />
                      </span>
                      <span className="text-gray-500 text-sm">{stat.unit}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Gold Price Trend</h3>
                <p className="text-gray-500">Today's price movement</p>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#FFD700" 
                  strokeWidth={3}
                  dot={{ fill: '#FFD700', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#FFD700', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Portfolio Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Portfolio</h3>
              <p className="text-gray-500">Asset distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to invest more?</h3>
              <p className="text-yellow-100">Take advantage of today's gold prices</p>
            </div>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/buy"
                  className="bg-white text-yellow-600 hover:bg-yellow-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center space-x-2"
                >
                  <Crown className="h-5 w-5" />
                  <span>Buy Gold</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/transactions"
                  className="bg-white/20 text-white hover:bg-white/30 px-8 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>View History</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
