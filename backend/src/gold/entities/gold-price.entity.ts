import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gold_prices')
export class GoldPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerGram: number; // Price in INR per gram

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerOunce: number; // Price in USD per ounce

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'live' })
  source: string; // 'live', 'manual', 'api'

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional price data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // Virtual fields for different units
  get pricePerKg(): number {
    return this.pricePerGram * 1000;
  }

  get pricePerTola(): number {
    return this.pricePerGram * 11.664; // 1 tola = 11.664 grams
  }
}
