import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

export type BannerType = 'info' | 'warning' | 'success' | 'error'

@Entity('admin_settings')
export class AdminSettings {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string // use a fixed id like 'default'

  @Column({ type: 'boolean', default: false })
  maintenanceMode!: boolean

  @Column({ type: 'integer', default: 10 })
  minBuyAmount!: number

  @Column({ type: 'varchar', default: 'live' })
  priceSource!: 'live' | 'manual'

  @Column({ type: 'numeric', nullable: true })
  manualPrice?: number | null

  @Column({ type: 'simple-json', nullable: true })
  features!: { buy: boolean; sell: boolean; sip: boolean; admin: boolean }

  @Column({ type: 'simple-json', nullable: true })
  banner!: { show: boolean; text: string; type: BannerType }

  // Trust & transparency
  @Column({ type: 'simple-json', nullable: true })
  trust!: { partnerName: string; purity: string; auditUrl?: string; insured: boolean; storageInfo?: string }

  // Fees and disclosures
  @Column({ type: 'simple-json', nullable: true })
  fees!: { spreadBps: number; convenienceFeeBps: number; gstRate: number }

  @Column({ type: 'simple-json', nullable: true })
  disclosures!: { howItWorksUrl?: string; faqUrl?: string; termsUrl?: string }

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
