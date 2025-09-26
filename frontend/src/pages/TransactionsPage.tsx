import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Eye,
  Sparkles
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import { fetchTransactions } from '../store/slices/transactionsSlice'
import { usePolling } from '../utils/usePolling'
import { Link } from 'react-router-dom'
import type { RootState } from '../store'

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((s: RootState) => s.transactions)
  const profile = useAppSelector((s: RootState) => s.user.profile)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchTransactions())
  }, [dispatch])

  // Live polling to keep data fresh
  usePolling(() => dispatch(fetchTransactions()), { intervalMs: 15000, immediate: false })

  // Only this user's transactions
  const userTxs = items.filter((tx: any) => {
    const uid = profile?.id
    if (!uid) return false
    return tx.userId === uid || tx.user?.id === uid
  })

  const filteredTransactions = userTxs.filter((tx: any) => {
    const matchesFilter = filter === 'all' || tx.status === filter
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Consider a transaction verified only if backend marked it so
  const isVerified = (tx: any) => tx?.status === 'completed' && tx?.paymentVerified === true

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'sell': return <ArrowDownLeft className="h-4 w-4 text-red-600" />
      default: return <Crown className="h-4 w-4 text-yellow-600" />
    }
  }

  const verifiedTxs = filteredTransactions.filter(isVerified)

  const totalInvested = verifiedTxs
    .filter((tx: any) => tx.type === 'buy')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

  const totalGold = verifiedTxs
    .filter((tx: any) => tx.type === 'buy')
    .reduce((sum: number, tx: any) => sum + Number(tx.goldQuantity), 0)

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
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
                  <History className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                  Transaction History
                </h1>
              </div>
              <p className="text-gray-600">Track all your gold investment activities</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-yellow-300 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-medium">Total Invested</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalInvested.toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mt-1">Across all purchases</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-yellow-600 font-medium">Total Gold</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalGold.toFixed(4)}g
            </div>
            <p className="text-gray-500 text-sm mt-1">Pure digital gold</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                <History className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-blue-600 font-medium">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredTransactions.length}
            </div>
            <p className="text-gray-500 text-sm mt-1">Total activities</p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full"
              />
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-red-600">{error}</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-500 mb-6">Start your gold investment journey today!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/buy"
                  className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  Buy Your First Gold
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gold Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredTransactions.map((tx: any, index: number) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Crown className="h-5 w-5 text-yellow-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                #{tx.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Gold {tx.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(tx.type)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            <span className="ml-1 capitalize">{tx.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-semibold">₹{Number(tx.amount).toLocaleString()}</div>
                          <div className="text-gray-500">INR</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-semibold">{Number(tx.goldQuantity).toFixed(4)}g</div>
                          <div className="text-gray-500">@₹{Number(tx.goldPricePerGram).toLocaleString()}/g</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-yellow-600 hover:text-yellow-900 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
