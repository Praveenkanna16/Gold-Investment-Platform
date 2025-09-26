import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { motion } from 'framer-motion'
import {
  Shield,
  Users as UsersIcon,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Bell,
  UserCog,
  Wrench,
  Filter,
  Search,
  Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePolling } from '../utils/usePolling'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [usersPage, setUsersPage] = useState(1)
  const [txsPage, setTxsPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [txFilter, setTxFilter] = useState('') // status
  const [txTypeFilter, setTxTypeFilter] = useState('') // buy/sell
  const [txOnlyVerified, setTxOnlyVerified] = useState(false)
  const [txFrom, setTxFrom] = useState('')
  const [txTo, setTxTo] = useState('')
  const [usersPagination, setUsersPagination] = useState<any>({})
  const [txsPagination, setTxsPagination] = useState<any>({})

  // Modals/state
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; user?: any }>({ open: false })
  const [adjustGrams, setAdjustGrams] = useState<number>(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [actionLoading, setActionLoading] = useState<string>('') // holds id during actions

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: '10',
        ...(userSearch && { search: userSearch }),
      })
      const res = await api.get(`/admin/users?${params}`)
      setUsers(res.data.data)
      setUsersPagination(res.data)
    } catch (e) {
      console.error('Failed to load users:', e)
    }
  }

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams({
        page: txsPage.toString(),
        limit: '10',
        ...(txFilter && { status: txFilter }),
        ...(txTypeFilter && { type: txTypeFilter }),
        ...(txOnlyVerified ? { verified: 'true' } : {}),
        ...(txFrom && { from: txFrom }),
        ...(txTo && { to: txTo }),
      })
      const res = await api.get(`/admin/transactions?${params}`)
      setTxs(res.data.data)
      setTxsPagination(res.data)
    } catch (e) {
      console.error('Failed to load transactions:', e)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadUsers(), loadTransactions()]).finally(() => setLoading(false))
  }, [usersPage, txsPage, userSearch, txFilter, txTypeFilter, txOnlyVerified, txFrom, txTo])

  // Polling to keep admin page fresh
  usePolling(() => loadUsers(), { intervalMs: 20000, immediate: false })
  usePolling(() => loadTransactions(), { intervalMs: 15000, immediate: false })

  // KPIs
  const verifiedTxs = useMemo(() => txs.filter((t: any) => t.status === 'completed' && t.paymentVerified === true), [txs])
  const totalInvested = useMemo(() => verifiedTxs.filter((t: any) => t.type === 'buy').reduce((s: number, t: any) => s + Number(t.amount || 0), 0), [verifiedTxs])
  const verifiedCount = verifiedTxs.length
  const aov = verifiedCount ? Math.round(totalInvested / verifiedCount) : 0

  // Helpers
  const exportCSV = (rows: any[], filename: string) => {
    if (!rows?.length) return toast.error('Nothing to export')
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const handleVerifyTx = async (id: string) => {
    try {
      setActionLoading(id)
      await api.post(`/admin/transactions/${id}/verify`)
      toast.success('Transaction verified')
      await loadTransactions()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to verify')
    } finally {
      setActionLoading('')
    }
  }

  const handleMarkFailed = async (id: string) => {
    try {
      setActionLoading(id)
      await api.post(`/admin/transactions/${id}/mark-failed`)
      toast.success('Transaction marked failed')
      await loadTransactions()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    } finally {
      setActionLoading('')
    }
  }

  const handleRefund = async (id: string) => {
    try {
      setActionLoading(id)
      await api.post(`/admin/transactions/${id}/refund`)
      toast.success('Refund initiated')
      await loadTransactions()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to refund')
    } finally {
      setActionLoading('')
    }
  }

  const updateRole = async (id: string, role: 'user' | 'admin') => {
    try {
      setActionLoading(id)
      await api.patch(`/admin/users/${id}/role`, { role })
      toast.success('Role updated')
      await loadUsers()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update role')
    } finally {
      setActionLoading('')
    }
  }

  const submitAdjust = async () => {
    if (!adjustModal.user) return
    if (!adjustGrams || adjustGrams === 0) return toast.error('Enter grams (positive or negative)')
    try {
      setActionLoading(adjustModal.user.id)
      await api.post(`/admin/users/${adjustModal.user.id}/adjust-gold`, { grams: adjustGrams, reason: adjustReason })
      toast.success('Adjustment recorded')
      setAdjustModal({ open: false })
      setAdjustGrams(0)
      setAdjustReason('')
      await loadUsers()
      await loadTransactions()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to adjust')
    } finally {
      setActionLoading('')
    }
  }

  const broadcast = async () => {
    if (!broadcastMsg.trim()) return toast.error('Enter a message')
    try {
      setActionLoading('broadcast')
      await api.post('/admin/broadcast', { message: broadcastMsg })
      toast.success('Broadcast sent')
      setBroadcastMsg('')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-yellow-600" /> Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(users, 'users.csv')} className="px-3 py-2 text-xs border rounded flex items-center gap-1"><Download className="h-4 w-4" /> Export Users</button>
          <button onClick={() => exportCSV(txs, 'transactions.csv')} className="px-3 py-2 text-xs border rounded flex items-center gap-1"><Download className="h-4 w-4" /> Export Tx</button>
        </div>
      </div>
      {loading && <p>Loading...</p>}

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Users</span>
            <UsersIcon className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{usersPagination.total || users.length || 0}</p>
        </div>
        <div className="bg-white rounded shadow p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verified Volume</span>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">₹{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded shadow p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verified Tx</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded shadow p-4 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Avg Order Value</span>
            <Crown className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold">₹{aov.toLocaleString()}</p>
        </div>
      </div>

      {/* Broadcast */}
      <div className="bg-white rounded shadow p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Broadcast a message</h3>
          </div>
        </div>
        <div className="flex gap-2">
          <input value={broadcastMsg} onChange={(e)=>setBroadcastMsg(e.target.value)} placeholder="Type announcement..." className="flex-1 px-3 py-2 border rounded" />
          <button disabled={actionLoading==='broadcast'} onClick={broadcast} className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50">Send</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Users</h3>
              <span className="text-sm text-gray-500">{usersPagination.total || users.length || 0} total</span>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-3 py-1 border rounded text-sm"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs">Email</th>
                  <th className="px-3 py-2 text-left text-xs">Name</th>
                  <th className="px-3 py-2 text-left text-xs">Role</th>
                  <th className="px-3 py-2 text-left text-xs">Gold (g)</th>
                  <th className="px-3 py-2 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2 text-xs">{u.email}</td>
                    <td className="px-3 py-2 text-xs">{u.firstName} {u.lastName}</td>
                    <td className="px-3 py-2 text-xs capitalize">{u.role}</td>
                    <td className="px-3 py-2 text-xs">{Number(u.goldBalance).toFixed(4)}</td>
                    <td className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <button disabled={actionLoading===u.id} onClick={()=>updateRole(u.id, 'user')} className="px-2 py-1 border rounded text-xs">Revoke Admin</button>
                        ) : (
                          <button disabled={actionLoading===u.id} onClick={()=>updateRole(u.id, 'admin')} className="px-2 py-1 border rounded text-xs">Make Admin</button>
                        )}
                        <button
                          onClick={()=>{ setAdjustModal({ open: true, user: u }); setAdjustGrams(0); setAdjustReason('') }}
                          className="px-2 py-1 border rounded text-xs flex items-center gap-1"
                        >
                          <Wrench className="h-3 w-3" /> Adjust Gold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td className="px-3 py-4 text-center text-gray-500 text-xs" colSpan={5}>No users</td></tr>
                )}
              </tbody>
            </table>
            {usersPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-3 border-t">
                <button
                  onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                  disabled={usersPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs">{usersPage} of {usersPagination.totalPages}</span>
                <button
                  onClick={() => setUsersPage(Math.min(usersPagination.totalPages, usersPage + 1))}
                  disabled={usersPage === usersPagination.totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Transactions</h3>
              <span className="text-sm text-gray-500">{txsPagination.total || txs.length || 0} total</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select
                className="px-3 py-1 border rounded text-sm"
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="px-3 py-1 border rounded text-sm"
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <input type="date" value={txFrom} onChange={(e)=>setTxFrom(e.target.value)} className="px-3 py-1 border rounded text-sm" />
              <input type="date" value={txTo} onChange={(e)=>setTxTo(e.target.value)} className="px-3 py-1 border rounded text-sm" />
              <label className="col-span-2 flex items-center gap-2 text-xs">
                <input type="checkbox" checked={txOnlyVerified} onChange={(e)=>setTxOnlyVerified(e.target.checked)} />
                Only verified
              </label>
            </div>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs">Ref</th>
                  <th className="px-3 py-2 text-left text-xs">User</th>
                  <th className="px-3 py-2 text-left text-xs">Type</th>
                  <th className="px-3 py-2 text-left text-xs">Status</th>
                  <th className="px-3 py-2 text-left text-xs">Amount</th>
                  <th className="px-3 py-2 text-left text-xs">Gold</th>
                  <th className="px-3 py-2 text-left text-xs">Verified</th>
                  <th className="px-3 py-2 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2 text-xs">{tx.id?.slice(0,8)}</td>
                    <td className="px-3 py-2 text-xs">{tx.user?.email || tx.userId?.slice(0,8)}</td>
                    <td className="px-3 py-2 text-xs capitalize">{tx.type}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">₹{Number(tx.amount).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs">{Number(tx.goldQuantity).toFixed(4)}g</td>
                    <td className="px-3 py-2 text-xs">{tx.paymentVerified ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        {!tx.paymentVerified && tx.status !== 'failed' && (
                          <button disabled={actionLoading===tx.id} onClick={()=>handleVerifyTx(tx.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" /> Verify
                          </button>
                        )}
                        {tx.status !== 'failed' && (
                          <button disabled={actionLoading===tx.id} onClick={()=>handleMarkFailed(tx.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" /> Fail
                          </button>
                        )}
                        {tx.paymentVerified && (
                          <button disabled={actionLoading===tx.id} onClick={()=>handleRefund(tx.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr><td className="px-3 py-4 text-center text-gray-500 text-xs" colSpan={8}>No transactions</td></tr>
                )}
              </tbody>
            </table>
            {txsPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-3 border-t">
                <button
                  onClick={() => setTxsPage(Math.max(1, txsPage - 1))}
                  disabled={txsPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs">{txsPage} of {txsPagination.totalPages}</span>
                <button
                  onClick={() => setTxsPage(Math.min(txsPagination.totalPages, txsPage + 1))}
                  disabled={txsPage === txsPagination.totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust Gold Modal */}
      {adjustModal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Adjust Gold for {adjustModal.user?.email}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Grams (use negative to deduct)</label>
                <input type="number" value={adjustGrams} onChange={(e)=>setAdjustGrams(Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Reason</label>
                <input value={adjustReason} onChange={(e)=>setAdjustReason(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setAdjustModal({ open: false })} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={submitAdjust} className="px-4 py-2 bg-yellow-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
