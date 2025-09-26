"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_config_1 = require("../../config/database.config");
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = require("bcrypt");
const gold_price_entity_1 = require("../../gold/entities/gold-price.entity");
async function run() {
    await database_config_1.AppDataSource.initialize();
    const userRepo = database_config_1.AppDataSource.getRepository(user_entity_1.User);
    const priceRepo = database_config_1.AppDataSource.getRepository(gold_price_entity_1.GoldPrice);
    const adminEmail = 'admin@gold.com';
    const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const admin = userRepo.create({
            email: adminEmail,
            firstName: 'Admin',
            lastName: 'User',
            password: await bcrypt.hash('Admin1234', 12),
            role: user_role_enum_1.UserRole.ADMIN,
            isEmailVerified: true,
        });
        await userRepo.save(admin);
        console.log('Seeded admin user: admin@gold.com / Admin1234');
    }
    const active = await priceRepo.findOne({ where: { isActive: true } });
    if (!active) {
        const price = priceRepo.create({ pricePerGram: 6000, pricePerOunce: 2200, currency: 'INR', source: 'seed', isActive: true });
        await priceRepo.save(price);
        console.log('Seeded default gold price');
    }
    await database_config_1.AppDataSource.destroy();
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map