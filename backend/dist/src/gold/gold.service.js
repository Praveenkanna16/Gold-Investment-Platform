"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gold_price_entity_1 = require("./entities/gold-price.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payments_service_1 = require("../payments/payments.service");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_type_enum_1 = require("../common/enums/transaction-type.enum");
const transaction_status_enum_1 = require("../common/enums/transaction-status.enum");
let GoldService = class GoldService {
    constructor(priceRepo, usersRepo, payments, txService) {
        this.priceRepo = priceRepo;
        this.usersRepo = usersRepo;
        this.payments = payments;
        this.txService = txService;
    }
    async getActivePrice() {
        let price = await this.priceRepo.findOne({ where: { isActive: true } });
        if (!price) {
            price = this.priceRepo.create({ pricePerGram: 6000, pricePerOunce: 2200, currency: 'INR', source: 'mock', isActive: true });
            await this.priceRepo.save(price);
        }
        return price;
    }
    async getBalance(userId) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        return { goldBalance: user?.goldBalance || 0 };
    }
    async initiateBuy(userId, amount) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        const price = await this.getActivePrice();
        const grams = +(amount / Number(price.pricePerGram)).toFixed(4);
        const tx = await this.txService.create({
            userId,
            type: transaction_type_enum_1.TransactionType.BUY,
            status: transaction_status_enum_1.TransactionStatus.PENDING,
            amount,
            goldQuantity: grams,
            goldPricePerGram: Number(price.pricePerGram),
        });
        const order = await this.payments.createPaymentOrder(Math.round(amount * 100), 'INR');
        return { tx, payment: order };
    }
    async confirmBuy(txId) {
        return { ok: true };
    }
};
exports.GoldService = GoldService;
exports.GoldService = GoldService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gold_price_entity_1.GoldPrice)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        payments_service_1.PaymentsService,
        transactions_service_1.TransactionsService])
], GoldService);
//# sourceMappingURL=gold.service.js.map