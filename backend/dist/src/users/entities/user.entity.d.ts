import { UserRole } from '../../common/enums/user-role.enum';
import { Transaction } from '../../transactions/entities/transaction.entity';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    goldBalance: number;
    phone: string;
    dateOfBirth: Date;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    transactions: Transaction[];
    get fullName(): string;
    portfolioValue?: number;
}
