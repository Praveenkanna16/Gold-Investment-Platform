import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly transactions;
    private readonly users;
    private readonly config;
    constructor(paymentsService: PaymentsService, transactions: TransactionsService, users: UsersService, config: ConfigService);
    webhook(payload: any, headers: any, req: any): Promise<{
        received: boolean;
    }>;
    phonepeRedirect(query: any, res: any): Promise<any>;
    private handleFinalize;
}
