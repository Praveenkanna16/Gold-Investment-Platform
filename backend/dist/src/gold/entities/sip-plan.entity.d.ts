import { User } from '../../users/entities/user.entity';
export type SIPFrequency = 'daily' | 'weekly' | 'monthly';
export type SIPStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export declare class SIPPlan {
    id: string;
    userId: string;
    user: User;
    amount: number;
    frequency: SIPFrequency;
    weeklyDay?: number | null;
    monthlyDay?: number | null;
    startDate: Date;
    status: SIPStatus;
    nextRunAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
