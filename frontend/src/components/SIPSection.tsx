import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

type Frequency = 'daily' | 'weekly' | 'monthly'

interface SIPSectionProps {
  currentPrice: number
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function nextOccurrences(start: Date, count: number, frequency: Frequency, weeklyDay?: number, monthlyDay?: number) {
  const result: Date[] = []
  let cursor = new Date(start)

  while (result.length < count) {
    if (frequency === 'daily') {
      result.push(new Date(cursor))
      cursor = addDays(cursor, 1)
    } else if (frequency === 'weekly') {
      const day = weeklyDay ?? cursor.getDay()
      // Move cursor to next occurrence of selected weekday (including today if matches)
      while (cursor.getDay() !== day) cursor = addDays(cursor, 1)
      result.push(new Date(cursor))
      cursor = addDays(cursor, 7)
    } else {
      // monthly: schedule on specific day-of-month
      const day = Math.min(monthlyDay ?? cursor.getDate(), 28) // keep safe for short months
      const m = cursor.getMonth()
      const y = cursor.getFullYear()
      const next = new Date(y, m, day)
      if (next < cursor) {
        // move to next month
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

export default function SIPSection({ currentPrice }: SIPSectionProps) {
  const [amount, setAmount] = useState<number>(500)
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [weeklyDay, setWeeklyDay] = useState<number>(1) // Mon
  const [monthlyDay, setMonthlyDay] = useState<number>(5)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [creating, setCreating] = useState(false)

  const schedule = useMemo(() => {
    const start = new Date(startDate)
    return nextOccurrences(start, 6, frequency, weeklyDay, monthlyDay)
  }, [startDate, frequency, weeklyDay, monthlyDay])

  const onCreate = async () => {
    if (amount < 10) {
      toast.error('Minimum SIP amount is ₹10')
      return
    }
    try {
      setCreating(true)
      await api.post('/gold/sip', {
        amount,
        frequency,
        weeklyDay,
        monthlyDay,
        startDate,
      })
      toast.success('SIP created successfully')
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to create SIP (ensure backend endpoint exists)'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <select
              value={weeklyDay}
              onChange={(e) => setWeeklyDay(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              {weekdays.map((w, i) => (
                <option key={i} value={i}>{w}</option>
              ))}
            </select>
          </div>
        )}
        {frequency === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
            <input
              type="number"
              min={1}
              max={28}
              value={monthlyDay}
              onChange={(e) => setMonthlyDay(Math.min(28, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-900">Upcoming Installments</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {schedule.map((d, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-yellow-100 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-700">{d.toLocaleDateString()}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">≈ {(currentPrice > 0 ? (amount / currentPrice) : 0).toFixed(4)}g</span>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        onClick={onCreate}
        disabled={creating || amount < 10}
        whileHover={{ scale: creating || amount < 10 ? 1 : 1.02 }}
        whileTap={{ scale: creating || amount < 10 ? 1 : 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
          creating || amount < 10
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {creating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Creating SIP...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Activate SIP</span>
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Note: SIP creation triggers server-side scheduling. Ensure backend has a /gold/sip endpoint.
      </p>
    </div>
  )
}
