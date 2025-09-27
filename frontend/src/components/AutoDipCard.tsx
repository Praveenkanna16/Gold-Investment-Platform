import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { createAutoDipRule, deleteAutoDipRule, fetchAutoDipRules, updateAutoDipRule } from '../store/slices/autoDipSlice'
import { Sparkles, Settings, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AutoDipCard() {
  const dispatch = useAppDispatch()
  const { rules, loading } = useAppSelector((s: RootState) => (s as any).autoDip || { rules: [], loading: false })
  const [form, setForm] = useState({ triggerType: 'price_drop_absolute', thresholdValue: 50, buyAmountInINR: 200, cooldownHours: 24 })

  useEffect(() => {
    dispatch(fetchAutoDipRules() as any)
  }, [dispatch])

  const onCreate = async () => {
    const res = await dispatch(createAutoDipRule(form as any) as any)
    if (res.error) toast.error(res.payload || 'Failed to create rule')
    else toast.success('Auto-Dip enabled')
  }

  const onDelete = async (id: string) => {
    const res = await dispatch(deleteAutoDipRule(id) as any)
    if (res.error) toast.error(res.payload || 'Failed to delete rule')
    else toast.success('Rule removed')
  }

  const onToggle = async (rule: any) => {
    const res = await dispatch(updateAutoDipRule({ id: rule.id, status: rule.status === 'active' ? 'paused' : 'active' }) as any)
    if (res.error) toast.error(res.payload || 'Failed to update rule')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Auto-Dip Buy</h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">Automatically buy when price dips. Configure threshold and amount.</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <select value={form.triggerType} onChange={(e)=>setForm(f=>({ ...f, triggerType: e.target.value }))} className="px-3 py-2 border rounded-xl">
          <option value="price_drop_absolute">Price drop by ₹/g</option>
          <option value="price_drop_percent">Price drop by %</option>
        </select>
        <input type="number" value={form.thresholdValue} onChange={(e)=>setForm(f=>({ ...f, thresholdValue: Number(e.target.value) }))} className="px-3 py-2 border rounded-xl" placeholder="Threshold" />
        <input type="number" value={form.buyAmountInINR} onChange={(e)=>setForm(f=>({ ...f, buyAmountInINR: Number(e.target.value) }))} className="px-3 py-2 border rounded-xl" placeholder="Buy Amount (₹)" />
        <input type="number" value={form.cooldownHours} onChange={(e)=>setForm(f=>({ ...f, cooldownHours: Number(e.target.value) }))} className="px-3 py-2 border rounded-xl" placeholder="Cooldown (hrs)" />
      </div>

      <button onClick={onCreate} disabled={loading} className="w-full py-2 bg-yellow-500 text-white rounded-xl font-semibold disabled:opacity-50">Enable Auto-Dip</button>

      <div className="mt-6 flex-1">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Rules</h4>
        {rules.length === 0 && <p className="text-sm text-gray-500">No rules yet.</p>}
        <div className="space-y-2">
          {rules.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{r.triggerType === 'price_drop_percent' ? `Drop ${r.thresholdValue}%` : `Drop ₹${r.thresholdValue}/g`}</div>
                <div className="text-xs text-gray-500">Buy ₹{r.buyAmountInINR} • {r.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>onToggle(r)} className="px-3 py-1 text-xs border rounded-xl flex items-center gap-1"><Settings className="h-4 w-4"/>{r.status === 'active' ? 'Pause' : 'Resume'}</button>
                <button onClick={()=>onDelete(r.id)} className="px-3 py-1 text-xs border rounded-xl text-red-600 flex items-center gap-1"><Trash2 className="h-4 w-4"/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
