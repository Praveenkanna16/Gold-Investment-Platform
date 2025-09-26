import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { adminFetchSIPs, adminPauseSIP, adminResumeSIP, adminCancelSIP } from '../store/slices/sipSlice'
import { motion } from 'framer-motion'
import { Calendar, PauseCircle, PlayCircle, XCircle, RefreshCw, Filter, Search, Users } from 'lucide-react'
import { usePolling } from '../utils/usePolling'
import toast from 'react-hot-toast'

export default function AdminSIPPage() {
  const dispatch = useAppDispatch()
  const { adminItems } = useAppSelector((s: RootState) => s.sip)
  const [status, setStatus] = useState('')
  const [frequency, setFrequency] = useState('')
  const [search, setSearch] = useState('')

  const params = useMemo(() => ({ status, frequency, search }), [status, frequency, search])

  const load = () => dispatch(adminFetchSIPs(params))

  useEffect(() => { load() }, [status, frequency])
  usePolling(() => load(), { intervalMs: 20000, immediate: false })

  const counts = useMemo(() => ({
    total: adminItems.length,
    active: adminItems.filter(i => i.status === 'active').length,
    paused: adminItems.filter(i => i.status === 'paused').length,
    cancelled: adminItems.filter(i => i.status === 'cancelled').length,
  }), [adminItems])

  const pause = async (id: string) => {
    const r = await dispatch(adminPauseSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to pause'); else toast.success('Paused'); load()
  }
  const resume = async (id: string) => {
    const r = await dispatch(adminResumeSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to resume'); else toast.success('Resumed'); load()
  }
  const cancel = async (id: string) => {
    const r = await dispatch(adminCancelSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to cancel'); else toast.success('Cancelled'); load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl"><Calendar className="h-6 w-6 text-white" /></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">Admin • SIP Management</h1>
          </div>
          <button onClick={()=>load()} className="px-3 py-2 text-xs border rounded flex items-center gap-1"><RefreshCw className="h-4 w-4"/>Refresh</button>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4 border"><div className="text-xs text-gray-500">Total</div><div className="text-2xl font-bold">{counts.total}</div></div>
          <div className="bg-white rounded shadow p-4 border"><div className="text-xs text-gray-500">Active</div><div className="text-2xl font-bold">{counts.active}</div></div>
          <div className="bg-white rounded shadow p-4 border"><div className="text-xs text-gray-500">Paused</div><div className="text-2xl font-bold">{counts.paused}</div></div>
          <div className="bg-white rounded shadow p-4 border"><div className="text-xs text-gray-500">Cancelled</div><div className="text-2xl font-bold">{counts.cancelled}</div></div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search email/user" className="px-3 py-2 border rounded text-sm" />
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={frequency} onChange={(e)=>setFrequency(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="">All frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="col-span-2 flex justify-end">
              <button onClick={()=>load()} className="px-3 py-2 border rounded text-sm flex items-center gap-1"><Filter className="h-4 w-4"/>Apply</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border p-2 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs">User</th>
                <th className="px-3 py-2 text-left text-xs">Amount</th>
                <th className="px-3 py-2 text-left text-xs">Frequency</th>
                <th className="px-3 py-2 text-left text-xs">Start</th>
                <th className="px-3 py-2 text-left text-xs">Next</th>
                <th className="px-3 py-2 text-left text-xs">Status</th>
                <th className="px-3 py-2 text-left text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminItems.map((sip: any) => (
                <tr key={sip.id} className="border-t">
                  <td className="px-3 py-2 text-xs">{sip.user?.email || sip.userId}</td>
                  <td className="px-3 py-2 text-xs">₹{Number(sip.amount).toFixed(0)}</td>
                  <td className="px-3 py-2 text-xs capitalize">{sip.frequency}</td>
                  <td className="px-3 py-2 text-xs">{sip.startDate ? new Date(sip.startDate).toLocaleDateString() : '-'}</td>
                  <td className="px-3 py-2 text-xs">{sip.nextRunAt ? new Date(sip.nextRunAt).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2 text-xs capitalize">{sip.status}</td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      {sip.status !== 'paused' && sip.status !== 'cancelled' && (<button onClick={()=>pause(sip.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1"><PauseCircle className="h-3 w-3"/>Pause</button>)}
                      {sip.status === 'paused' && (<button onClick={()=>resume(sip.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1"><PlayCircle className="h-3 w-3"/>Resume</button>)}
                      {sip.status !== 'cancelled' && (<button onClick={()=>cancel(sip.id)} className="px-2 py-1 border rounded text-xs flex items-center gap-1"><XCircle className="h-3 w-3"/>Cancel</button>)}
                    </div>
                  </td>
                </tr>
              ))}
              {adminItems.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-gray-500 text-sm" colSpan={7}>No SIPs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
