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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const transactions_service_1 = require("../transactions/transactions.service");
const users_service_1 = require("../users/users.service");
const transaction_status_enum_1 = require("../common/enums/transaction-status.enum");
const config_1 = require("@nestjs/config");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, transactions, users, config) {
        this.paymentsService = paymentsService;
        this.transactions = transactions;
        this.users = users;
        this.config = config;
    }
    async webhook(payload, headers, req) {
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(payload));
        const stripeSig = headers['stripe-signature'];
        if (stripeSig) {
            const event = this.paymentsService.constructStripeEvent(rawBody, stripeSig);
            if (!event)
                throw new common_1.BadRequestException('Invalid Stripe signature');
            const data = event.data?.object;
            const txId = data?.metadata?.txId;
            const userId = data?.metadata?.userId;
            const status = data?.status === 'succeeded' ? 'success' : 'failed';
            await this.handleFinalize(txId, userId, status, data?.id, data?.id, 'stripe');
            return { received: true };
        }
        const rzpSig = headers['x-razorpay-signature'];
        if (rzpSig) {
            const ok = this.paymentsService.verifyRazorpaySignature(rawBody, rzpSig);
            if (!ok)
                throw new common_1.BadRequestException('Invalid Razorpay signature');
            const parsed = this.paymentsService.parseWebhook(payload);
            await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'razorpay');
            return { received: true };
        }
        if (payload?.merchantTransactionId || payload?.transactionId || payload?.code) {
            const mtid = payload?.merchantTransactionId || payload?.orderId || payload?.transactionId;
            const statusResp = await this.paymentsService.checkPhonePeStatus(mtid);
            const tx = await this.transactions.findById(mtid);
            const userId = tx?.userId || payload?.merchantUserId;
            if (tx && userId) {
                await this.handleFinalize(mtid, userId, statusResp.status === 'success' ? 'success' : statusResp.status === 'failed' ? 'failed' : undefined, statusResp.transactionId, mtid, 'phonepe');
            }
            return { received: true };
        }
        const parsed = this.paymentsService.parseWebhook(payload);
        await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'mock');
        return { received: true };
    }
    async phonepeRedirect(query, res) {
        const mtid = query?.merchantTransactionId || query?.transactionId || query?.mtid;
        if (!mtid) {
            return res.status(400).json({ message: 'Missing merchantTransactionId' });
        }
        const statusResp = await this.paymentsService.checkPhonePeStatus(mtid);
        const tx = await this.transactions.findById(mtid);
        const userId = tx?.userId;
        if (tx && userId && statusResp.status !== 'pending') {
            await this.handleFinalize(mtid, userId, statusResp.status === 'success' ? 'success' : 'failed', statusResp.transactionId, mtid, 'phonepe');
        }
        const frontend = this.config.get('FRONTEND_URL') || 'http://localhost:3001';
        const redirectUrl = `${frontend}/?payment=${statusResp.status}`;
        return res.redirect(302, redirectUrl);
    }
    async handleFinalize(txId, userId, status, paymentId, orderId, provider) {
        if (!txId || !userId)
            return;
        const tx = await this.transactions.findById(txId);
        if (!tx)
            return;
        if (status === 'success') {
            await this.transactions.update(txId, {
                status: transaction_status_enum_1.TransactionStatus.COMPLETED,
                paymentId,
                paymentOrderId: orderId,
                paymentSignature: provider,
                completedAt: new Date(),
            });
            await this.users.incrementGoldBalance(userId, Number(tx.goldQuantity));
        }
        else if (status === 'failed') {
            await this.transactions.update(txId, {
                status: transaction_status_enum_1.TransactionStatus.FAILED,
                paymentId,
                paymentOrderId: orderId,
                paymentSignature: provider,
            });
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Payment provider webhook (test mode)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('phonepe/redirect'),
    (0, swagger_1.ApiOperation)({ summary: 'PhonePe redirect endpoint to finalize and forward to frontend' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "phonepeRedirect", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        transactions_service_1.TransactionsService,
        users_service_1.UsersService,
        config_1.ConfigService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map