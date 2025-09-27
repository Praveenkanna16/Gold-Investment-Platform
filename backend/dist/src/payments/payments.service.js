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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const axios_1 = require("axios");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    get phonepeConfig() {
        const merchantId = this.config.get('PHONEPE_MERCHANT_ID');
        const saltKey = this.config.get('PHONEPE_SALT_KEY');
        const saltIndex = this.config.get('PHONEPE_SALT_INDEX') || '1';
        const baseUrl = this.config.get('PHONEPE_BASE_URL') ||
            'https://api-preprod.phonepe.com/apis/pg-sandbox';
        const callbackUrl = this.config.get('PHONEPE_CALLBACK_URL') ||
            `${this.config.get('API_BASE_URL', 'http://localhost:3000/api/v1')}/payments/webhook`;
        const redirectUrl = this.config.get('PHONEPE_REDIRECT_URL') ||
            `${this.config.get('API_BASE_URL', 'http://localhost:3000/api/v1')}/payments/phonepe/redirect`;
        return { merchantId, saltKey, saltIndex, baseUrl, callbackUrl, redirectUrl };
    }
    buildPhonePeHeaders(path, payloadBase64) {
        const { saltKey, saltIndex, merchantId } = this.phonepeConfig;
        const xVerify = crypto
            .createHash('sha256')
            .update(payloadBase64 + path + saltKey)
            .digest('hex');
        return {
            'Content-Type': 'application/json',
            'X-VERIFY': `${xVerify}###${saltIndex}`,
            'X-MERCHANT-ID': merchantId,
        };
    }
    buildPhonePeStatusHeaders(path) {
        const { saltKey, saltIndex, merchantId } = this.phonepeConfig;
        const xVerify = crypto
            .createHash('sha256')
            .update(path + saltKey)
            .digest('hex');
        return {
            'Content-Type': 'application/json',
            'X-VERIFY': `${xVerify}###${saltIndex}`,
            'X-MERCHANT-ID': merchantId,
        };
    }
    async createPaymentOrder(amountInMinorUnit, currency = 'INR', meta) {
        const { merchantId, baseUrl, callbackUrl, redirectUrl } = this.phonepeConfig;
        if (!merchantId) {
            this.logger.warn('PhonePe merchantId not configured, returning mock order');
            return { provider: 'mock', order: { id: `mock_${Date.now()}`, amount: amountInMinorUnit, currency } };
        }
        const merchantTransactionId = meta?.txId || `TXN_${Date.now()}`;
        const merchantUserId = meta?.userId || 'ANON_USER';
        const request = {
            merchantId,
            merchantTransactionId,
            merchantUserId,
            amount: amountInMinorUnit,
            redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl,
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };
        const payloadBase64 = Buffer.from(JSON.stringify(request)).toString('base64');
        const path = '/pg/v1/pay';
        try {
            const resp = await axios_1.default.post(`${baseUrl}${path}`, { request: payloadBase64 }, { headers: this.buildPhonePeHeaders(path, payloadBase64) });
            const url = resp?.data?.data?.instrumentResponse?.redirectInfo?.url;
            if (!url) {
                this.logger.warn(`PhonePe did not return redirect url, response code: ${resp?.data?.code}`);
                throw new Error('No redirect URL from PhonePe');
            }
            return { provider: 'phonepe', order: { redirectUrl: url, merchantTransactionId } };
        }
        catch (error) {
            this.logger.warn(`PhonePe order creation failed: ${error?.message}`);
            return { provider: 'mock', order: { id: `mock_${Date.now()}`, amount: amountInMinorUnit, currency } };
        }
    }
    async checkPhonePeStatus(merchantTransactionId) {
        const { merchantId, baseUrl } = this.phonepeConfig;
        if (!merchantId)
            return { status: 'failed' };
        const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
        try {
            const resp = await axios_1.default.get(`${baseUrl}${path}`, { headers: this.buildPhonePeStatusHeaders(path) });
            const code = resp?.data?.code || resp?.data?.data?.responseCode || resp?.data?.data?.state;
            const transactionId = resp?.data?.data?.transactionId;
            if (code === 'SUCCESS')
                return { status: 'success', transactionId };
            if (code === 'PENDING')
                return { status: 'pending' };
            return { status: 'failed' };
        }
        catch (e) {
            this.logger.warn(`PhonePe status check failed: ${e?.message}`);
            return { status: 'failed' };
        }
    }
    verifyRazorpaySignature(_rawBody, _signature) {
        return false;
    }
    constructStripeEvent(_rawBody, _signature) {
        return null;
    }
    parseWebhook(payload) {
        const fromBody = {
            txId: payload?.txId,
            userId: payload?.userId,
            paymentId: payload?.paymentId,
            orderId: payload?.orderId,
            status: payload?.status,
        };
        if (payload?.merchantTransactionId || payload?.transactionId || payload?.code) {
            const success = (payload?.code || payload?.state) === 'SUCCESS' || payload?.success === true;
            return {
                txId: payload?.merchantTransactionId || fromBody.txId,
                userId: payload?.merchantUserId || fromBody.userId,
                paymentId: payload?.transactionId || fromBody.paymentId,
                orderId: payload?.merchantTransactionId || fromBody.orderId,
                status: success ? 'success' : 'failed',
            };
        }
        const rzpPayment = payload?.payload?.payment?.entity;
        if (rzpPayment) {
            return {
                txId: rzpPayment?.notes?.txId || fromBody.txId,
                userId: rzpPayment?.notes?.userId || fromBody.userId,
                paymentId: rzpPayment?.id,
                orderId: rzpPayment?.order_id,
                status: rzpPayment?.status === 'captured' ? 'success' : 'failed',
            };
        }
        return fromBody;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map