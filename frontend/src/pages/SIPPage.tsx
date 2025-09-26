import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, PauseCircle, PlayCircle, XCircle, Plus, Edit, Save, RefreshCw, Crown, Clock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { fetchSIPs, createSIP, updateSIP, pauseSIP, resumeSIP, cancelSIP } from '../store/slices/sipSlice'
import toast from 'react-hot-toast'
import { usePolling } from '../utils/usePolling'

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function nextOccurrences(start: Date, count: number, frequency: 'daily' | 'weekly' | 'monthly', weeklyDay?: number, monthlyDay?: number) {
  const result: Date[] = []
  let cursor = new Date(start)
  while (result.length < count) {
    if (frequency === 'daily') {
      result.push(new Date(cursor))
      cursor = addDays(cursor, 1)
    } else if (frequency === 'weekly') {
      const day = weeklyDay ?? cursor.getDay()
      while (cursor.getDay() !== day) cursor = addDays(cursor, 1)
      result.push(new Date(cursor))
      cursor = addDays(cursor, 7)
    } else {
      const day = Math.min(monthlyDay ?? cursor.getDate(), 28)
      const m = cursor.getMonth()
      const y = cursor.getFullYear()
      const next = new Date(y, m, day)
      if (next < cursor) {
        result.push(new Date(y, m + 1, day))
        cursor = new Date(y, m + 2, day)
      } else {
        result.push(next)
        cursor = new Date(y, m + 1, day)
      }
    }
  }
  return result
}

export default function SIPPage() {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((s: RootState) => s.sip)
  const price = useAppSelector((s: RootState) => s.gold.price)

  const [amount, setAmount] = useState<number>(500)
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [weeklyDay, setWeeklyDay] = useState<number>(1)
  const [monthlyDay, setMonthlyDay] = useState<number>(5)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0,10)
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<number>(0)
  const [editStart, setEditStart] = useState<string>('')

  useEffect(() => {
    dispatch(fetchSIPs())
  }, [dispatch])

  usePolling(() => dispatch(fetchSIPs()), { intervalMs: 30000, immediate: false })

  const currentPrice = Number(price?.pricePerGram ?? 0)
  const schedule = useMemo(() => nextOccurrences(new Date(startDate), 6, frequency, weeklyDay, monthlyDay), [startDate, frequency, weeklyDay, monthlyDay])

  const onCreate = async () => {
    if (amount < 10) return toast.error('Minimum SIP amount is ₹10')
    const res = await dispatch(createSIP({ amount, frequency, weeklyDay, monthlyDay, startDate }))
    if ((res as any).error) {
      toast.error((res as any).payload || 'Failed to create SIP')
    } else {
      toast.success('SIP created')
      setAmount(500)
    }
  }

  const onEdit = (sip: any) => {
    setEditingId(sip.id)
    setEditAmount(sip.amount)
    setEditStart(sip.startDate?.slice(0,10) || new Date().toISOString().slice(0,10))
  }

  const onSave = async (id: string) => {
    if (editAmount < 10) return toast.error('Minimum is ₹10')
    const res = await dispatch(updateSIP({ id, amount: editAmount, startDate: editStart }))
    if ((res as any).error) toast.error((res as any).payload || 'Failed to update')
    else {
      toast.success('Updated')
      setEditingId(null)
    }
  }

  const actions = {
    pause: async (id: string) => {
      const r = await dispatch(pauseSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to pause'); else toast.success('Paused')
    },
    resume: async (id: string) => {
      const r = await dispatch(resumeSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to resume'); else toast.success('Resumed')
    },
    cancel: async (id: string) => {
      const r = await dispatch(cancelSIP(id)); if ((r as any).error) toast.error((r as any).payload || 'Failed to cancel'); else toast.success('Cancelled')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl"><Calendar className="h-6 w-6 text-white" /></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">Gold SIPs</h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Automate your gold investments with daily/weekly/monthly plans.</p>
        </motion.div>

        {/* Create SIP */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Create a SIP</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Amount (₹)</label>
              <input type="number" min={10} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Frequency</label>
              <select value={frequency} onChange={(e)=>setFrequency(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {frequency === 'weekly' && (
              <div>
                <label className="block text-xs text-gray-600">Day of Week (0-6)</label>
                <input type="number" min={0} max={6} value={weeklyDay} onChange={(e)=>setWeeklyDay(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" />
              </div>
            )}
            {frequency === 'monthly' && (
              <div>
                <label className="block text-xs text-gray-600">Day of Month (1-28)</label>
                <input type="number" min={1} max={28} value={monthlyDay} onChange={(e)=>setMonthlyDay(Math.min(28, Math.max(1, Number(e.target.value))))} className="w-full px-3 py-2 border rounded-xl" />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600">Start Date</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {schedule.map((d, i) => (
              <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">{d.toLocaleDateString()}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">≈ {(currentPrice>0?(amount/currentPrice):0).toFixed(4)}g</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} onClick={onCreate} className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Create SIP
            </motion.button>
          </div>
        </div>

        {/* SIP List */}
        <div className="bg-white rounded-2xl shadow-xl border p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Your SIPs</h3>
            <button onClick={()=>dispatch(fetchSIPs())} className="px-3 py-2 text-xs border rounded flex items-center gap-1"><RefreshCw className="h-4 w-4"/>Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs">Amount</th>
                  <th className="px-3 py-2 text-left text-xs">Frequency</th>
                  <th className="px-3 py-2 text-left text-xs">Start</th>
                  <th className="px-3 py-2 text-left text-xs">Next run</th>
                  <th className="px-3 py-2 text-left text-xs">Status</th>
                  <th className="px-3 py-2 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sip: any) => (
                  <tr key={sip.id} className="border-t">
                    <td className="px-3 py-2 text-sm">
                      {editingId === sip.id ? (
                        <input type="number" min={10} value={editAmount} onChange={(e)=>setEditAmount(Number(e.target.value))} className="px-2 py-1 border rounded" />
                      ) : (
                        <>₹{Number(sip.amount).toFixed(0)}</>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm capitalize">{sip.frequency}</td>
                    <td className="px-3 py-2 text-sm">
                      {editingId === sip.id ? (
                        <input type="date" value={editStart} onChange={(e)=>setEditStart(e.target.value)} className="px-2 py-1 border rounded" />
                      ) : (
                        <>{sip.startDate ? new Date(sip.startDate).toLocaleDateString() : '-'}</>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">{sip.nextRunAt ? new Date(sip.nextRunAt).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`px-2 py-1 rounded ${sip.status==='active'?'bg-green-100 text-green-800': sip.status==='paused'?'bg-yellow-100 text-yellow-800': sip.status==='cancelled'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>{sip.status}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        {editingId === sip.id ? (
                          <button onClick={()=>onSave(sip.id)} className="px-2 py-1 border rounded flex items-center gap-1"><Save className="h-3 w-3"/> Save</button>
                        ) : (
                          <button onClick={()=>onEdit(sip)} className="px-2 py-1 border rounded flex items-center gap-1"><Edit className="h-3 w-3"/> Edit</button>
                        )}
                        {sip.status !== 'paused' && sip.status !== 'cancelled' && (
                          <button onClick={()=>actions.pause(sip.id)} className="px-2 py-1 border rounded flex items-center gap-1"><PauseCircle className="h-3 w-3 text-yellow-700"/> Pause</button>
                        )}
                        {sip.status === 'paused' && (
                          <button onClick={()=>actions.resume(sip.id)} className="px-2 py-1 border rounded flex items-center gap-1"><PlayCircle className="h-3 w-3 text-green-700"/> Resume</button>
                        )}
                        {sip.status !== 'cancelled' && (
                          <button onClick={()=>actions.cancel(sip.id)} className="px-2 py-1 border rounded flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600"/> Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-gray-500 text-sm" colSpan={6}>No SIPs yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
