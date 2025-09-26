import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly transactions;
    private readonly users;
    constructor(paymentsService: PaymentsService, transactions: TransactionsService, users: UsersService);
    webhook(payload: any, headers: any, req: any): Promise<{
        received: boolean;
    }>;
    private handleFinalize;
}
