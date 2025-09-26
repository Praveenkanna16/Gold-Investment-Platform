import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { GoldService } from './gold.service';
import { GoldPrice } from './entities/gold-price.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../common/enums/transaction-type.enum';

describe('GoldService', () => {
  let service: GoldService;
  let goldPriceRepository: any;
  let usersRepository: any;
  let paymentsService: any;
  let transactionsService: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoldService,
        { provide: getRepositoryToken(GoldPrice), useValue: mockGoldPriceRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();

    service = module.get<GoldService>(GoldService);
    goldPriceRepository = module.get(getRepositoryToken(GoldPrice));
    usersRepository = module.get(getRepositoryToken(User));
    paymentsService = module.get<PaymentsService>(PaymentsService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
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
        type: TransactionType.BUY,
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
        type: TransactionType.BUY,
        status: expect.any(String),
        amount: 1000,
        goldQuantity: expect.any(Number),
        goldPricePerGram: 6000,
      });
    });

    it('should throw BadRequestException for invalid amount', async () => {
      await expect(service.initiateBuy('123', 0)).rejects.toThrow(BadRequestException);
      await expect(service.initiateBuy('123', -100)).rejects.toThrow(BadRequestException);
    });
  });
});
