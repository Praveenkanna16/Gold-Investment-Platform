import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AdminSettings } from './entities/admin-settings.entity';
import { AdminSettingsController } from './admin.settings.controller';
import { SIPPlan } from '../gold/entities/sip-plan.entity';
import { AutoDipRule } from '../gold/entities/auto-dip-rule.entity';
import { AdminSIPController } from './admin.sip.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, AdminSettings, SIPPlan, AutoDipRule])],
  controllers: [AdminController, AdminSettingsController, AdminSIPController],
})
export class AdminModule {}
