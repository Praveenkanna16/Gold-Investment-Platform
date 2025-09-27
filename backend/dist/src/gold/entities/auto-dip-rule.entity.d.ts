import { User } from '../../users/entities/user.entity';
export type AutoDipTriggerType = 'price_drop_percent' | 'price_drop_absolute';
export type AutoDipStatus = 'active' | 'paused';
export declare class AutoDipRule {
    id: string;
    userId: string;
    user: User;
    triggerType: AutoDipTriggerType;
    thresholdValue: number;
    buyAmountInINR: number;
    cooldownHours: number;
    lastTriggeredAt?: Date | null;
    status: AutoDipStatus;
    createdAt: Date;
    updatedAt: Date;
}
