import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'

export type SIPFrequency = 'daily' | 'weekly' | 'monthly'
export type SIPStatus = 'active' | 'paused' | 'cancelled' | 'completed'

@Entity('sip_plans')
export class SIPPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'varchar' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User

  @Column({ type: 'integer' })
  amount!: number // in INR

  @Column({ type: 'varchar' })
  frequency!: SIPFrequency

  @Column({ type: 'smallint', nullable: true })
  weeklyDay?: number | null // 0-6 (Sun-Sat)

  @Column({ type: 'smallint', nullable: true })
  monthlyDay?: number | null // 1-31

  @Column({ type: 'datetime' })
  startDate!: Date

  @Column({ type: 'varchar', default: 'active' })
  status!: SIPStatus

  @Column({ type: 'datetime', nullable: true })
  nextRunAt?: Date | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
