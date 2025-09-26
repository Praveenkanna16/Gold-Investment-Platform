import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { fetchSettings, updateSettings } from '../store/slices/settingsSlice'
import { ToggleLeft, ToggleRight, Settings, AlertCircle, CheckCircle, DollarSign, Antenna, Wrench, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePolling } from '../utils/usePolling'

export default function AdminAccessPage() {
  const dispatch = useAppDispatch()
  const { settings, loading } = useAppSelector((s: RootState) => s.settings)

  const [form, setForm] = useState({
    maintenanceMode: false,
    minBuyAmount: 10,
    priceSource: 'live' as 'live' | 'manual',
    manualPrice: undefined as number | undefined,
    features: { buy: true, sell: true, sip: true, admin: true },
    banner: { show: false, text: '', type: 'info' as 'info' | 'warning' | 'success' | 'error' },
  })

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  usePolling(() => dispatch(fetchSettings()), { intervalMs: 30000, immediate: false })

  useEffect(() => {
    if (settings) setForm(settings as any)
  }, [settings])

  const onSave = async () => {
    const res = await dispatch(updateSettings(form as any))
    if ((res as any).error) toast.error((res as any).payload || 'Failed to update settings')
    else toast.success('Settings updated')
  }

  const setFeature = (key: keyof typeof form.features, value: boolean) => setForm(f => ({ ...f, features: { ...f.features, [key]: value } }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl"><Settings className="h-6 w-6 text-white" /></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">Admin • Access Controls</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>dispatch(fetchSettings())} className="px-3 py-2 text-xs border rounded flex items-center gap-1"><RefreshCw className="h-4 w-4"/>Refresh</button>
            <button disabled={loading} onClick={onSave} className="px-4 py-2 bg-yellow-500 text-white rounded flex items-center gap-2 disabled:opacity-50"><Save className="h-4 w-4"/>Save Changes</button>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Wrench className="h-5 w-5 text-gray-600"/>Maintenance Mode</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Temporarily disable user actions while performing maintenance.</p>
            <button onClick={()=>setForm(f=>({ ...f, maintenanceMode: !f.maintenanceMode }))} className="px-3 py-2 border rounded flex items-center gap-2">
              {form.maintenanceMode ? <ToggleRight className="h-5 w-5 text-green-600"/> : <ToggleLeft className="h-5 w-5 text-gray-400"/>}
              {form.maintenanceMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Pricing & Limits */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><DollarSign className="h-5 w-5 text-gray-600"/>Pricing & Limits</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Minimum Buy Amount (₹)</label>
              <input type="number" min={1} value={form.minBuyAmount} onChange={(e)=>setForm(f=>({ ...f, minBuyAmount: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Price Source</label>
              <select value={form.priceSource} onChange={(e)=>setForm(f=>({ ...f, priceSource: e.target.value as any }))} className="w-full px-3 py-2 border rounded-xl">
                <option value="live">Live</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Manual Price (INR/g)</label>
              <input type="number" value={form.manualPrice ?? ''} onChange={(e)=>setForm(f=>({ ...f, manualPrice: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 border rounded-xl" placeholder="Only if manual" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Antenna className="h-5 w-5 text-gray-600"/>Feature Toggles</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['buy','sell','sip','admin'] as const).map(key => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-xl">
                <span className="capitalize text-gray-700">{key}</span>
                <button onClick={()=>setFeature(key, !form.features[key])} className="px-3 py-2 border rounded flex items-center gap-2">
                  {form.features[key] ? <CheckCircle className="h-5 w-5 text-green-600"/> : <AlertCircle className="h-5 w-5 text-gray-400"/>}
                  {form.features[key] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="bg-white rounded-2xl shadow-xl border p-6">
          <h3 className="text-xl font-bold mb-3">Site Banner</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 border rounded-xl px-3 py-2">
              <input type="checkbox" checked={form.banner.show} onChange={(e)=>setForm(f=>({ ...f, banner: { ...f.banner, show: e.target.checked } }))} />
              Show Banner
            </label>
            <select value={form.banner.type} onChange={(e)=>setForm(f=>({ ...f, banner: { ...f.banner, type: e.target.value as any } }))} className="px-3 py-2 border rounded-xl">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
            <input value={form.banner.text} onChange={(e)=>setForm(f=>({ ...f, banner: { ...f.banner, text: e.target.value } }))} className="md:col-span-2 px-3 py-2 border rounded-xl" placeholder="Banner message..." />
          </div>
        </div>
      </div>
    </div>
  )
}
