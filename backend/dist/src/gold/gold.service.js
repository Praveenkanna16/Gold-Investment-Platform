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
const admin_settings_entity_1 = require("../admin/entities/admin-settings.entity");
let GoldService = class GoldService {
    constructor(priceRepo, usersRepo, settingsRepo, payments, txService) {
        this.priceRepo = priceRepo;
        this.usersRepo = usersRepo;
        this.settingsRepo = settingsRepo;
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
        let settings = await this.settingsRepo.findOne({ where: { id: 'default' } });
        if (!settings) {
            settings = this.settingsRepo.create({
                id: 'default',
                maintenanceMode: false,
                minBuyAmount: 10,
                priceSource: 'live',
                manualPrice: null,
                features: { buy: true, sell: true, sip: true, admin: true },
                banner: { show: false, text: '', type: 'info' },
                trust: { partnerName: '', purity: '24K 99.9', insured: true },
                fees: { spreadBps: 0, convenienceFeeBps: 0, gstRate: 3 },
                disclosures: {},
            });
            await this.settingsRepo.save(settings);
        }
        const minBuy = Math.max(1, settings.minBuyAmount || 10);
        if (amount < minBuy)
            throw new common_1.BadRequestException(`Minimum purchase amount is ₹${minBuy}`);
        const price = await this.getActivePrice();
        const grams = +(amount / Number(price.pricePerGram)).toFixed(4);
        const spreadBps = Number(settings.fees?.spreadBps ?? 0);
        const convBps = Number(settings.fees?.convenienceFeeBps ?? 0);
        const gstRate = Number(settings.fees?.gstRate ?? 3);
        const baseAmount = amount;
        const spread = Math.round((baseAmount * (spreadBps / 10000)) * 100) / 100;
        const convenienceFee = Math.round((baseAmount * (convBps / 10000)) * 100) / 100;
        const gst = Math.round((convenienceFee * (gstRate / 100)) * 100) / 100;
        const totalPayable = Math.round((baseAmount + spread + convenienceFee + gst) * 100) / 100;
        const tx = await this.txService.create({
            userId,
            type: transaction_type_enum_1.TransactionType.BUY,
            status: transaction_status_enum_1.TransactionStatus.PENDING,
            amount: baseAmount,
            goldQuantity: grams,
            goldPricePerGram: Number(price.pricePerGram),
            metadata: {
                pricing: { baseAmount, spread, convenienceFee, gst, totalPayable, spreadBps, convBps, gstRate },
            },
        });
        const order = await this.payments.createPaymentOrder(Math.round(totalPayable * 100), 'INR', {
            txId: tx.id,
            userId,
        });
        return { tx, payment: order, pricing: { baseAmount, spread, convenienceFee, gst, totalPayable } };
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
    __param(2, (0, typeorm_1.InjectRepository)(admin_settings_entity_1.AdminSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payments_service_1.PaymentsService,
        transactions_service_1.TransactionsService])
], GoldService);
//# sourceMappingURL=gold.service.js.map