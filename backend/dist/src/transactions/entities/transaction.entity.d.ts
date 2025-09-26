import { TransactionStatus } from '../../common/enums/transaction-status.enum';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { User } from '../../users/entities/user.entity';
export declare class Transaction {
    id: string;
    userId: string;
    user: User;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    goldQuantity: number;
    goldPricePerGram: number;
    paymentId: string;
    paymentOrderId: string;
    paymentSignature: string;
    notes: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
    get reference(): string;
}
