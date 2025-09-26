"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../src/users/entities/user.entity");
const transaction_entity_1 = require("../src/transactions/entities/transaction.entity");
const gold_price_entity_1 = require("../src/gold/entities/gold-price.entity");
describe('Gold Investment Platform E2E', () => {
    let app;
    let userRepo;
    let txRepo;
    let priceRepo;
    let authToken;
    let userId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
        await app.init();
        userRepo = moduleFixture.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        txRepo = moduleFixture.get((0, typeorm_1.getRepositoryToken)(transaction_entity_1.Transaction));
        priceRepo = moduleFixture.get((0, typeorm_1.getRepositoryToken)(gold_price_entity_1.GoldPrice));
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
            const updatedTx = await txRepo.findOne({ where: { id: tx.id } });
            expect(updatedTx.status).toBe('completed');
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
        let adminToken;
        beforeAll(async () => {
            const adminData = {
                email: 'admin@test.com',
                password: 'Admin123!',
                firstName: 'Admin',
                lastName: 'User',
            };
            const registerRes = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(adminData);
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
//# sourceMappingURL=app.e2e-spec.js.map