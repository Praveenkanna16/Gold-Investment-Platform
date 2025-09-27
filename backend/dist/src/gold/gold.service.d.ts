import { Repository } from 'typeorm';
import { GoldPrice } from './entities/gold-price.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AdminSettings } from '../admin/entities/admin-settings.entity';
export declare class GoldService {
    private readonly priceRepo;
    private readonly usersRepo;
    private readonly settingsRepo;
    private readonly payments;
    private readonly txService;
    constructor(priceRepo: Repository<GoldPrice>, usersRepo: Repository<User>, settingsRepo: Repository<AdminSettings>, payments: PaymentsService, txService: TransactionsService);
    getActivePrice(): Promise<GoldPrice>;
    getBalance(userId: string): Promise<{
        goldBalance: number;
    }>;
    initiateBuy(userId: string, amount: number): Promise<{
        tx: import("../transactions/entities/transaction.entity").Transaction;
        payment: {
            provider: string;
            order: {
                id: string;
                amount: number;
                currency: string;
                redirectUrl?: undefined;
                merchantTransactionId?: undefined;
            };
        } | {
            provider: string;
            order: {
                redirectUrl: any;
                merchantTransactionId: string;
                id?: undefined;
                amount?: undefined;
                currency?: undefined;
            };
        };
        pricing: {
            baseAmount: number;
            spread: number;
            convenienceFee: number;
            gst: number;
            totalPayable: number;
        };
    }>;
    confirmBuy(txId: string): Promise<{
        ok: boolean;
    }>;
}
