import 'reflect-metadata';
import { AppDataSource } from '../../config/database.config';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { GoldPrice } from '../../gold/entities/gold-price.entity';

async function run() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const priceRepo = AppDataSource.getRepository(GoldPrice);

  // Admin user
  const adminEmail = 'admin@gold.com';
  const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const admin = userRepo.create({
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      password: await bcrypt.hash('Admin1234', 12),
      role: UserRole.ADMIN,
      isEmailVerified: true,
    });
    await userRepo.save(admin);
    console.log('Seeded admin user: admin@gold.com / Admin1234');
  }

  // Default price
  const active = await priceRepo.findOne({ where: { isActive: true } });
  if (!active) {
    const price = priceRepo.create({ pricePerGram: 6000, pricePerOunce: 2200, currency: 'INR', source: 'seed', isActive: true });
    await priceRepo.save(price);
    console.log('Seeded default gold price');
  }

  await AppDataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
