import { Repository } from 'typeorm';
import { SIPPlan } from '../gold/entities/sip-plan.entity';
import { User } from '../users/entities/user.entity';
export declare class AdminSIPController {
    private readonly sipRepo;
    private readonly userRepo;
    constructor(sipRepo: Repository<SIPPlan>, userRepo: Repository<User>);
    list(status?: string, frequency?: string, search?: string): Promise<SIPPlan[]>;
    pause(id: string): Promise<SIPPlan>;
    resume(id: string): Promise<SIPPlan>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
