import { Repository } from 'typeorm';
import { AdminSettings } from './entities/admin-settings.entity';
export declare class AdminSettingsController {
    private readonly repo;
    constructor(repo: Repository<AdminSettings>);
    private getOrCreateDefault;
    getSettings(): Promise<AdminSettings>;
    patchSettings(patch: Partial<AdminSettings>): Promise<AdminSettings>;
}
