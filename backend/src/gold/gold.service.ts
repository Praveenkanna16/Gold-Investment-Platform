import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoldPrice } from './entities/gold-price.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { TransactionStatus } from '../common/enums/transaction-status.enum';
import { AdminSettings } from '../admin/entities/admin-settings.entity';

@Injectable()
export class GoldService {
  constructor(
    @InjectRepository(GoldPrice)
    private readonly priceRepo: Repository<GoldPrice>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(AdminSettings)
    private readonly settingsRepo: Repository<AdminSettings>,
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

    // Settings for min buy and fees
    let settings = await this.settingsRepo.findOne({ where: { id: 'default' } });
    if (!settings) {
      settings = this.settingsRepo.create({
        id: 'default',
        maintenanceMode: false,
        minBuyAmount: 10,
        priceSource: 'live',
        manualPrice: null,
        features: { buy: true, sell: true, sip: true, admin: true },
        banner: { show: false, text: '', type: 'info' },
        trust: { partnerName: '', purity: '24K 99.9', insured: true },
        fees: { spreadBps: 0, convenienceFeeBps: 0, gstRate: 3 },
        disclosures: {},
      });
      await this.settingsRepo.save(settings);
    }

    const minBuy = Math.max(1, settings.minBuyAmount || 10);
    if (amount < minBuy) throw new BadRequestException(`Minimum purchase amount is ₹${minBuy}`);

    const price = await this.getActivePrice();
    const grams = +(amount / Number(price.pricePerGram)).toFixed(4);

    // Fees & pricing
    const spreadBps = Number(settings.fees?.spreadBps ?? 0);
    const convBps = Number(settings.fees?.convenienceFeeBps ?? 0);
    const gstRate = Number(settings.fees?.gstRate ?? 3);
    const baseAmount = amount;
    const spread = Math.round((baseAmount * (spreadBps / 10000)) * 100) / 100;
    const convenienceFee = Math.round((baseAmount * (convBps / 10000)) * 100) / 100;
    const gst = Math.round((convenienceFee * (gstRate / 100)) * 100) / 100;
    const totalPayable = Math.round((baseAmount + spread + convenienceFee + gst) * 100) / 100;

    // Create pending transaction
    const tx = await this.txService.create({
      userId,
      type: TransactionType.BUY,
      status: TransactionStatus.PENDING,
      amount: baseAmount,
      goldQuantity: grams,
      goldPricePerGram: Number(price.pricePerGram),
      metadata: {
        pricing: { baseAmount, spread, convenienceFee, gst, totalPayable, spreadBps, convBps, gstRate },
      },
    });

    // Create payment order (amount in minor unit, e.g., paise)
    const order = await this.payments.createPaymentOrder(Math.round(totalPayable * 100), 'INR', {
      txId: tx.id,
      userId,
    });

    return { tx, payment: order, pricing: { baseAmount, spread, convenienceFee, gst, totalPayable } };
  }

  async confirmBuy(txId: string) {
    // Called via webhook ideally; MVP placeholder not changing state here
    return { ok: true };
  }
}
