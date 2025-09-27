import { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'

export default function PriceAlertsCard() {
  const price = useAppSelector((s: RootState) => s.gold.price)
  const current = Number(price?.pricePerGram ?? 0)
  const [target, setTarget] = useState<number>(() => {
    const saved = localStorage.getItem('priceAlertTarget')
    return saved ? Number(saved) : 0
  })
  const [enabled, setEnabled] = useState<boolean>(() => {
    return localStorage.getItem('priceAlertEnabled') === '1'
  })

  useEffect(() => {
    localStorage.setItem('priceAlertTarget', String(target || 0))
  }, [target])

  useEffect(() => {
    localStorage.setItem('priceAlertEnabled', enabled ? '1' : '0')
  }, [enabled])

  const triggered = useMemo(() => enabled && !!target && current > 0 && current <= target, [enabled, target, current])

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col min-h-[260px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {triggered ? <BellRing className="h-5 w-5 text-green-600"/> : <Bell className="h-5 w-5 text-yellow-600"/>}
          <h3 className="text-lg font-bold text-gray-900">Price Alerts</h3>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} /> Enable
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-600 mb-1">Current Price</div>
          <div className="text-base font-semibold">₹{current.toLocaleString()}/g</div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Alert me when ≤</label>
          <input type="number" value={target || ''} onChange={(e)=>setTarget(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl" placeholder="₹/g" />
        </div>
      </div>

      {triggered && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-2">
          Alert active: price is at or below your target
        </div>
      )}
    </div>
  )
}
