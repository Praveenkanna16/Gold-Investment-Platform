import { Repository } from 'typeorm';
import { SIPPlan } from './entities/sip-plan.entity';
export declare class GoldSIPController {
    private readonly repo;
    constructor(repo: Repository<SIPPlan>);
    list(user: any): Promise<SIPPlan[]>;
    create(user: any, body: any): Promise<SIPPlan>;
    update(user: any, id: string, patch: any): Promise<SIPPlan>;
    pause(user: any, id: string): Promise<SIPPlan>;
    resume(user: any, id: string): Promise<SIPPlan>;
    remove(user: any, id: string): Promise<{
        ok: boolean;
    }>;
}
