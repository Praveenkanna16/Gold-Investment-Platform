import { useMemo, useState } from 'react'
import { Calculator, ArrowRightLeft } from 'lucide-react'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { useNavigate } from 'react-router-dom'

export default function ConverterCard() {
  const navigate = useNavigate()
  const price = useAppSelector((s: RootState) => s.gold.price)
  const pricePerGram = Number(price?.pricePerGram ?? 0)
  const [mode, setMode] = useState<'inr-to-grams' | 'grams-to-inr'>('inr-to-grams')
  const [value, setValue] = useState<number>(500)

  const result = useMemo(() => {
    if (!pricePerGram || value <= 0) return 0
    return mode === 'inr-to-grams' ? value / pricePerGram : value * pricePerGram
  }, [mode, value, pricePerGram])

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">INR ↔ Grams Converter</h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <select value={mode} onChange={(e)=>setMode(e.target.value as any)} className="px-3 py-2 border rounded-xl">
          <option value="inr-to-grams">INR → Grams</option>
          <option value="grams-to-inr">Grams → INR</option>
        </select>
        <ArrowRightLeft className="h-5 w-5 text-gray-400" />
      </div>

      <input
        type="number"
        min={1}
        value={value}
        onChange={(e)=>setValue(Number(e.target.value))}
        className="w-full px-3 py-2 border rounded-xl mb-2"
        placeholder={mode === 'inr-to-grams' ? 'Enter INR' : 'Enter grams'}
      />
      <div className="text-sm text-gray-600">Live price: ₹{pricePerGram.toLocaleString()}/g</div>

      <div className="mt-3 p-3 bg-yellow-50 rounded-xl text-sm">
        {mode === 'inr-to-grams' ? (
          <span>≈ <span className="font-semibold text-yellow-700">{result.toFixed(4)}</span> grams</span>
        ) : (
          <span>≈ ₹<span className="font-semibold text-yellow-700">{result.toFixed(2)}</span></span>
        )}
      </div>

      <button onClick={()=>{
        const amt = mode === 'inr-to-grams' ? value : Math.round(result)
        navigate('/buy')
      }} className="mt-auto w-full py-2 bg-yellow-500 text-white rounded-xl font-semibold">Buy this amount</button>
    </div>
  )
}
