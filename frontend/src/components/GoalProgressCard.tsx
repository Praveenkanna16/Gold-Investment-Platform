import { useEffect, useMemo, useState } from 'react'
import { Target, PlusCircle } from 'lucide-react'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'
import { useNavigate } from 'react-router-dom'

export default function GoalProgressCard() {
  const navigate = useNavigate()
  const grams = useAppSelector((s: RootState) => s.gold.balance)
  const [goalGrams, setGoalGrams] = useState<number>(() => {
    const saved = localStorage.getItem('goalGrams')
    return saved ? Number(saved) : 10
  })

  useEffect(() => {
    localStorage.setItem('goalGrams', String(goalGrams))
  }, [goalGrams])

  const progress = useMemo(() => {
    const pct = Math.min(100, Math.max(0, grams > 0 ? (grams / goalGrams) * 100 : 0))
    const remaining = Math.max(0, goalGrams - grams)
    return { pct, remaining }
  }, [grams, goalGrams])

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">Goal: {goalGrams}g</h3>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min={1} max={1000} value={goalGrams} onChange={(e)=>setGoalGrams(Number(e.target.value))} className="w-24 px-3 py-1 border rounded-xl text-sm" />
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: `${progress.pct}%` }} />
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <span className="font-semibold text-yellow-700">{progress.pct.toFixed(1)}%</span> complete • {progress.remaining.toFixed(4)}g to go
      </div>

      <button onClick={()=>navigate('/buy')} className="mt-auto w-full py-2 bg-yellow-500 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2"><PlusCircle className="h-4 w-4"/> Boost +₹100</button>
    </div>
  )
}
