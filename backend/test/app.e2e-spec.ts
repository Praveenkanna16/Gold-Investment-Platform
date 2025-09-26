import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Transaction } from '../src/transactions/entities/transaction.entity';
import { GoldPrice } from '../src/gold/entities/gold-price.entity';

describe('Gold Investment Platform E2E', () => {
  let app: INestApplication;
  let userRepo: any;
  let txRepo: any;
  let priceRepo: any;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepo = moduleFixture.get(getRepositoryToken(User));
    txRepo = moduleFixture.get(getRepositoryToken(Transaction));
    priceRepo = moduleFixture.get(getRepositoryToken(GoldPrice));

    // Setup test data
    await priceRepo.save({
      pricePerGram: 6000,
      pricePerOunce: 2200,
      currency: 'INR',
      source: 'test',
      isActive: true,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe(registerData.email);
      authToken = res.body.accessToken;
      userId = res.body.user.id;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('Buy Gold Flow', () => {
    it('should get current gold price', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gold/price')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.pricePerGram).toBe(6000);
    });

    it('should get user gold balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gold/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.goldBalance).toBe(0);
    });

    it('should initiate buy gold transaction', async () => {
      const buyData = { amount: 1000 };

      const res = await request(app.getHttpServer())
        .post('/api/v1/gold/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buyData)
        .expect(201);

      expect(res.body).toHaveProperty('tx');
      expect(res.body).toHaveProperty('payment');
      expect(res.body.tx.amount).toBe(1000);
      expect(res.body.tx.goldQuantity).toBeCloseTo(0.1667, 3);
    });

    it('should complete payment via webhook', async () => {
      // Get the pending transaction
      const tx = await txRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
      
      const webhookData = {
        txId: tx.id,
        userId,
        status: 'success',
        paymentId: 'test_payment_123',
        orderId: 'test_order_123',
      };

      await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .send(webhookData)
        .expect(201);

      // Verify transaction is completed
      const updatedTx = await txRepo.findOne({ where: { id: tx.id } });
      expect(updatedTx.status).toBe('completed');

      // Verify user balance is updated
      const user = await userRepo.findOne({ where: { id: userId } });
      expect(Number(user.goldBalance)).toBeCloseTo(0.1667, 3);
    });

    it('should show updated balance after purchase', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/gold/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Number(res.body.goldBalance)).toBeCloseTo(0.1667, 3);
    });

    it('should show transaction in history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('completed');
      expect(res.body[0].type).toBe('buy');
    });
  });

  describe('Admin Features', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Create admin user
      const adminData = {
        email: 'admin@test.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      };

      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(adminData);

      // Update user role to admin
      await userRepo.update({ email: adminData.email }, { role: 'admin' });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: adminData.email, password: adminData.password });

      adminToken = loginRes.body.accessToken;
    });

    it('should list users with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 10);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should list transactions with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  it('/ (GET) health check', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.body.message).toContain('Gold Investment Platform API');
  });
});
