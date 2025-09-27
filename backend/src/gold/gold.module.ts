import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldController } from './gold.controller';
import { GoldService } from './gold.service';
import { GoldPrice } from './entities/gold-price.entity';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentsModule } from '../payments/payments.module';
import { User } from '../users/entities/user.entity';
import { SIPPlan } from './entities/sip-plan.entity';
import { AutoDipRule } from './entities/auto-dip-rule.entity';
import { GoldSIPController } from './sip.controller';
import { GoldAutoDipController } from './auto-dip.controller';
import { AdminSettings } from '../admin/entities/admin-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoldPrice, User, SIPPlan, AutoDipRule, AdminSettings]),
    UsersModule,
    TransactionsModule,
    PaymentsModule,
  ],
  controllers: [GoldController, GoldSIPController, GoldAutoDipController],
  providers: [GoldService],
})
export class GoldModule {}
