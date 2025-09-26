import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
export declare class TransactionsService {
    private readonly txRepo;
    constructor(txRepo: Repository<Transaction>);
    findForUser(userId: string): Promise<Transaction[]>;
    create(tx: Partial<Transaction>): Promise<Transaction>;
    update(id: string, data: Partial<Transaction>): Promise<Transaction>;
    listAll(): Promise<Transaction[]>;
    findById(id: string): Promise<Transaction | null>;
}
