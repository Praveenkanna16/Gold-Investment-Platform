import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  type: TransactionType;

  @Column({ type: 'varchar', default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // Amount in currency (INR/USD)

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  goldQuantity: number; // Gold quantity in grams

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  goldPricePerGram: number; // Gold price at the time of transaction

  @Column({ nullable: true })
  paymentId: string; // Payment gateway transaction ID

  @Column({ nullable: true })
  paymentOrderId: string; // Payment gateway order ID

  @Column({ nullable: true })
  paymentSignature: string; // Payment gateway signature for verification

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional transaction metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Virtual field for transaction reference
  get reference(): string {
    return `TXN-${this.id.substring(0, 8).toUpperCase()}`;
  }
}
