import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly txService;
    constructor(txService: TransactionsService);
    getMyTransactions(user: any): Promise<import("./entities/transaction.entity").Transaction[]>;
}
