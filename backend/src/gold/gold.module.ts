import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldController } from './gold.controller';
import { GoldService } from './gold.service';
import { GoldPrice } from './entities/gold-price.entity';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaymentsModule } from '../payments/payments.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoldPrice, User]),
    UsersModule,
    TransactionsModule,
    PaymentsModule,
  ],
  controllers: [GoldController],
  providers: [GoldService],
})
export class GoldModule {}
