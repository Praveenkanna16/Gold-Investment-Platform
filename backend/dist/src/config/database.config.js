"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.databaseConfig = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const gold_price_entity_1 = require("../gold/entities/gold-price.entity");
const admin_settings_entity_1 = require("../admin/entities/admin-settings.entity");
const sip_plan_entity_1 = require("../gold/entities/sip-plan.entity");
const auto_dip_rule_entity_1 = require("../gold/entities/auto-dip-rule.entity");
const databaseConfig = (configService) => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    const databaseUrl = configService.get('DATABASE_URL');
    if (!databaseUrl && !isProduction) {
        return {
            type: 'sqlite',
            database: 'gold_platform.db',
            entities: [user_entity_1.User, transaction_entity_1.Transaction, gold_price_entity_1.GoldPrice, admin_settings_entity_1.AdminSettings, sip_plan_entity_1.SIPPlan, auto_dip_rule_entity_1.AutoDipRule],
            synchronize: true,
            logging: true,
        };
    }
    return {
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'gold_investment_platform'),
        entities: [user_entity_1.User, transaction_entity_1.Transaction, gold_price_entity_1.GoldPrice, admin_settings_entity_1.AdminSettings, sip_plan_entity_1.SIPPlan, auto_dip_rule_entity_1.AutoDipRule],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: !isProduction,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        logging: !isProduction,
    };
};
exports.databaseConfig = databaseConfig;
const dataSourceOptions = {
    type: 'sqlite',
    database: 'gold_platform.db',
    entities: [user_entity_1.User, transaction_entity_1.Transaction, gold_price_entity_1.GoldPrice, admin_settings_entity_1.AdminSettings, sip_plan_entity_1.SIPPlan, auto_dip_rule_entity_1.AutoDipRule],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
};
exports.AppDataSource = new typeorm_1.DataSource(dataSourceOptions);
//# sourceMappingURL=database.config.js.map