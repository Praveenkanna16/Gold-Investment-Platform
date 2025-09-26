import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoldPrice } from './entities/gold-price.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { TransactionStatus } from '../common/enums/transaction-status.enum';

@Injectable()
export class GoldService {
  constructor(
    @InjectRepository(GoldPrice)
    private readonly priceRepo: Repository<GoldPrice>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly payments: PaymentsService,
    private readonly txService: TransactionsService,
  ) {}

  async getActivePrice(): Promise<GoldPrice> {
    let price = await this.priceRepo.findOne({ where: { isActive: true } });
    if (!price) {
      price = this.priceRepo.create({ pricePerGram: 6000, pricePerOunce: 2200, currency: 'INR', source: 'mock', isActive: true });
      await this.priceRepo.save(price);
    }
    return price;
  }

  async getBalance(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    return { goldBalance: user?.goldBalance || 0 };
  }

  async initiateBuy(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const price = await this.getActivePrice();
    const grams = +(amount / Number(price.pricePerGram)).toFixed(4);

    // Create pending transaction
    const tx = await this.txService.create({
      userId,
      type: TransactionType.BUY,
      status: TransactionStatus.PENDING,
      amount,
      goldQuantity: grams,
      goldPricePerGram: Number(price.pricePerGram),
    });

    // Create payment order (amount in minor unit, e.g., paise)
    const order = await this.payments.createPaymentOrder(Math.round(amount * 100), 'INR');

    return { tx, payment: order };
  }

  async confirmBuy(txId: string) {
    // Called via webhook ideally; MVP placeholder not changing state here
    return { ok: true };
  }
}
