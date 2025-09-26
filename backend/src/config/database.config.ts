import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { GoldPrice } from '../gold/entities/gold-price.entity';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const databaseUrl = configService.get('DATABASE_URL');
  
  // Use SQLite for local development if no DATABASE_URL is provided
  if (!databaseUrl && !isProduction) {
    return {
      type: 'sqlite',
      database: 'gold_platform.db',
      entities: [User, Transaction, GoldPrice],
      synchronize: true, // Auto-sync for SQLite development
      logging: true,
    };
  }
  
  // PostgreSQL for production or when DATABASE_URL is provided
  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', 'password'),
    database: configService.get('DATABASE_NAME', 'gold_investment_platform'),
    entities: [User, Transaction, GoldPrice],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: !isProduction, // Only sync in development
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    logging: !isProduction,
  };
};

// DataSource for TypeORM CLI
const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: 'gold_platform.db',
  entities: [User, Transaction, GoldPrice],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
