import { ShieldCheck, BadgeCheck, Link as LinkIcon } from 'lucide-react'
import { useAppSelector } from '../utils/hooks'
import type { RootState } from '../store'

export default function TrustCenterCard() {
  const settings = useAppSelector((s: RootState) => s.settings.settings)
  const trust = settings?.trust
  const fees = settings?.fees
  const disclosures = settings?.disclosures

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Trust & Transparency</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600">Storage Partner</div>
          <div className="text-base font-semibold text-gray-900">{trust?.partnerName || '—'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Purity</div>
          <div className="text-base font-semibold text-gray-900">{trust?.purity || '24K 99.9'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Insurance</div>
          <div className="text-base font-semibold text-gray-900">{trust?.insured ? 'Insured Storage' : '—'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Storage</div>
          <div className="text-base font-semibold text-gray-900">{trust?.storageInfo || 'Secure, audited vaults'}</div>
        </div>
      </div>

      {fees && (
        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-900">
          <div className="font-semibold mb-1">Fee Transparency</div>
          <div>Spread: <span className="font-medium">{fees.spreadBps ?? 0} bps</span> • Convenience: <span className="font-medium">{fees.convenienceFeeBps ?? 0} bps</span> • GST: <span className="font-medium">{fees.gstRate ?? 3}%</span></div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 mt-auto">
        {trust?.auditUrl && (
          <a href={trust.auditUrl} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs border rounded-xl inline-flex items-center gap-2 text-blue-600">
            <BadgeCheck className="h-4 w-4" /> Audit Certificate
          </a>
        )}
        {disclosures?.howItWorksUrl && (
          <a href={disclosures.howItWorksUrl} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs border rounded-xl inline-flex items-center gap-2">
            <LinkIcon className="h-4 w-4" /> How Digital Gold Works
          </a>
        )}
        {disclosures?.faqUrl && (
          <a href={disclosures.faqUrl} target="_blank" rel="noreferrer" className="px-3 py-2 text-xs border rounded-xl inline-flex items-center gap-2">
            <LinkIcon className="h-4 w-4" /> FAQs
          </a>
        )}
      </div>
    </div>
  )
}
