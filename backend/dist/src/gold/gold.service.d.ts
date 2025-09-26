import { Repository } from 'typeorm';
import { GoldPrice } from './entities/gold-price.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class GoldService {
    private readonly priceRepo;
    private readonly usersRepo;
    private readonly payments;
    private readonly txService;
    constructor(priceRepo: Repository<GoldPrice>, usersRepo: Repository<User>, payments: PaymentsService, txService: TransactionsService);
    getActivePrice(): Promise<GoldPrice>;
    getBalance(userId: string): Promise<{
        goldBalance: number;
    }>;
    initiateBuy(userId: string, amount: number): Promise<{
        tx: import("../transactions/entities/transaction.entity").Transaction;
        payment: {
            provider: string;
            order: any;
        };
    }>;
    confirmBuy(txId: string): Promise<{
        ok: boolean;
    }>;
}
