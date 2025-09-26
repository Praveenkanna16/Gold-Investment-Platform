import { GoldService } from './gold.service';
export declare class GoldController {
    private readonly goldService;
    constructor(goldService: GoldService);
    balance(user: any): Promise<{
        goldBalance: number;
    }>;
    price(): Promise<import("./entities/gold-price.entity").GoldPrice>;
    buy(user: any, body: {
        amount: number;
    }): Promise<{
        tx: import("../transactions/entities/transaction.entity").Transaction;
        payment: {
            provider: string;
            order: any;
        };
    }>;
}
