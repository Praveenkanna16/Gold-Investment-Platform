import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'

export type AutoDipTriggerType = 'price_drop_percent' | 'price_drop_absolute'
export type AutoDipStatus = 'active' | 'paused'

@Entity('auto_dip_rules')
export class AutoDipRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'varchar' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User

  @Column({ type: 'varchar' })
  triggerType!: AutoDipTriggerType

  @Column({ type: 'numeric' })
  thresholdValue!: number // percent or INR/g depending on triggerType

  @Column({ type: 'integer' })
  buyAmountInINR!: number

  @Column({ type: 'integer', default: 24 })
  cooldownHours!: number

  @Column({ type: 'datetime', nullable: true })
  lastTriggeredAt?: Date | null

  @Column({ type: 'varchar', default: 'active' })
  status!: AutoDipStatus

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
