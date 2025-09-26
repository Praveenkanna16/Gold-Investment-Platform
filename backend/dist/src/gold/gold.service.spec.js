"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const gold_service_1 = require("./gold.service");
const gold_price_entity_1 = require("./entities/gold-price.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payments_service_1 = require("../payments/payments.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_type_enum_1 = require("../common/enums/transaction-type.enum");
describe('GoldService', () => {
    let service;
    let goldPriceRepository;
    let usersRepository;
    let paymentsService;
    let transactionsService;
    const mockGoldPrice = {
        id: '1',
        pricePerGram: 6000,
        pricePerOunce: 2200,
        currency: 'INR',
        isActive: true,
    };
    const mockUser = {
        id: '123',
        goldBalance: 5.5,
    };
    beforeEach(async () => {
        const mockGoldPriceRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        const mockUsersRepository = {
            findOne: jest.fn(),
        };
        const mockPaymentsService = {
            createPaymentOrder: jest.fn(),
        };
        const mockTransactionsService = {
            create: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                gold_service_1.GoldService,
                { provide: (0, typeorm_1.getRepositoryToken)(gold_price_entity_1.GoldPrice), useValue: mockGoldPriceRepository },
                { provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User), useValue: mockUsersRepository },
                { provide: payments_service_1.PaymentsService, useValue: mockPaymentsService },
                { provide: transactions_service_1.TransactionsService, useValue: mockTransactionsService },
            ],
        }).compile();
        service = module.get(gold_service_1.GoldService);
        goldPriceRepository = module.get((0, typeorm_1.getRepositoryToken)(gold_price_entity_1.GoldPrice));
        usersRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        paymentsService = module.get(payments_service_1.PaymentsService);
        transactionsService = module.get(transactions_service_1.TransactionsService);
    });
    describe('getActivePrice', () => {
        it('should return active gold price', async () => {
            goldPriceRepository.findOne.mockResolvedValue(mockGoldPrice);
            const result = await service.getActivePrice();
            expect(result).toEqual(mockGoldPrice);
        });
        it('should create default price if none exists', async () => {
            goldPriceRepository.findOne.mockResolvedValue(null);
            goldPriceRepository.create.mockReturnValue(mockGoldPrice);
            goldPriceRepository.save.mockResolvedValue(mockGoldPrice);
            const result = await service.getActivePrice();
            expect(goldPriceRepository.create).toHaveBeenCalled();
            expect(goldPriceRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockGoldPrice);
        });
    });
    describe('getBalance', () => {
        it('should return user gold balance', async () => {
            usersRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.getBalance('123');
            expect(result).toEqual({ goldBalance: 5.5 });
        });
        it('should return 0 if user not found', async () => {
            usersRepository.findOne.mockResolvedValue(null);
            const result = await service.getBalance('123');
            expect(result).toEqual({ goldBalance: 0 });
        });
    });
    describe('initiateBuy', () => {
        it('should initiate buy transaction successfully', async () => {
            const mockTransaction = {
                id: 'tx-123',
                userId: '123',
                type: transaction_type_enum_1.TransactionType.BUY,
                amount: 1000,
                goldQuantity: 0.1667,
            };
            goldPriceRepository.findOne.mockResolvedValue(mockGoldPrice);
            transactionsService.create.mockResolvedValue(mockTransaction);
            paymentsService.createPaymentOrder.mockResolvedValue({
                provider: 'mock',
                order: { id: 'order-123' },
            });
            const result = await service.initiateBuy('123', 1000);
            expect(result).toHaveProperty('tx', mockTransaction);
            expect(result).toHaveProperty('payment');
            expect(transactionsService.create).toHaveBeenCalledWith({
                userId: '123',
                type: transaction_type_enum_1.TransactionType.BUY,
                status: expect.any(String),
                amount: 1000,
                goldQuantity: expect.any(Number),
                goldPricePerGram: 6000,
            });
        });
        it('should throw BadRequestException for invalid amount', async () => {
            await expect(service.initiateBuy('123', 0)).rejects.toThrow(common_1.BadRequestException);
            await expect(service.initiateBuy('123', -100)).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=gold.service.spec.js.map