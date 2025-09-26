const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'gold_platform.db',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    
    // Check if admin exists
    const userRepo = AppDataSource.getRepository('User');
    const existing = await userRepo.findOne({ where: { email: 'admin@gold.com' } });
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin1234', 12);
      await userRepo.save({
        email: 'admin@gold.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log('Admin user created');
    }
    
    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
