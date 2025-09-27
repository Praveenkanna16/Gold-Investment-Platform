import { Gift, Trophy } from 'lucide-react'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'

export default function RewardsCard() {
  const txs = useAppSelector((s: RootState) => s.transactions.items as any[])
  const sips = useAppSelector((s: RootState) => s.sip.items)

  const totalInvested = (txs || [])
    .filter((t) => t.type === 'buy' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const activeSips = sips.filter((s) => s.status === 'active').length
  const points = Math.floor(totalInvested / 100) + activeSips * 50

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Gift className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Rewards & Badges</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Your Points</div>
          <div className="text-2xl font-extrabold text-purple-700">{points}</div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-sm text-gray-700">{activeSips > 0 ? 'SIP Streak' : 'Get started'}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 mt-auto">
        Earn 1 point per ₹100 invested and 50 bonus points per active SIP.
      </div>
    </div>
  )
}
