import { Repository } from 'typeorm';
import { AutoDipRule } from './entities/auto-dip-rule.entity';
export declare class GoldAutoDipController {
    private readonly repo;
    constructor(repo: Repository<AutoDipRule>);
    list(user: any): Promise<AutoDipRule[]>;
    create(user: any, body: any): Promise<AutoDipRule>;
    update(user: any, id: string, patch: any): Promise<AutoDipRule>;
    remove(user: any, id: string): Promise<{
        ok: boolean;
    }>;
}
