import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { fetchSIPs, pauseSIP, resumeSIP } from '../store/slices/sipSlice'
import { Calendar, PauseCircle, PlayCircle, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SIPCard() {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((s: RootState) => s.sip)
  const price = useAppSelector((s: RootState) => s.gold.price)
  const pricePerGram = Number(price?.pricePerGram ?? 0)

  useEffect(() => {
    dispatch(fetchSIPs() as any)
  }, [dispatch])

  const active = useMemo(() => items.filter(i => i.status === 'active'), [items])

  const onToggle = async (id: string, status: string) => {
    const fn = status === 'active' ? pauseSIP : resumeSIP
    const res = await dispatch((fn as any)(id))
    if ((res as any).error) toast.error((res as any).payload || 'Failed to update SIP')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Wallet className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">Your SIP Plans</h3>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-600">No SIPs yet. Create one from the Buy page to automate your savings.</p>
      )}

      <div className="space-y-2 flex-1">
        {items.map((p) => (
          <div key={p.id} className="p-3 border rounded-xl flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">₹{p.amount} • {p.frequency}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Next: {p.nextRunAt ? new Date(p.nextRunAt).toLocaleDateString() : '—'}
                {pricePerGram > 0 && <span>• ≈ {(p.amount / pricePerGram).toFixed(4)}g</span>}
              </div>
            </div>
            <button onClick={()=>onToggle(p.id, p.status)} className="px-3 py-1 text-xs border rounded-xl flex items-center gap-1">
              {p.status === 'active' ? (<><PauseCircle className="h-4 w-4"/>Pause</>) : (<><PlayCircle className="h-4 w-4"/>Resume</>)}
            </button>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-2">
          {active.length} active plan{active.length > 1 ? 's' : ''} running automatically
        </div>
      )}
    </div>
  )}
