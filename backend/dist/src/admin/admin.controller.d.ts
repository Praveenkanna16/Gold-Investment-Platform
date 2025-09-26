import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { UserRole } from '../common/enums/user-role.enum';
export declare class AdminController {
    private readonly users;
    private readonly txs;
    constructor(users: Repository<User>, txs: Repository<Transaction>);
    listUsers(page?: number, limit?: number, search?: string, role?: UserRole): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listTransactions(page?: number, limit?: number, status?: string, type?: string): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
