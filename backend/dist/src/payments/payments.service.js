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
let Razorpay;
let Stripe;
try {
    Razorpay = require('razorpay');
}
catch (e) {
}
try {
    Stripe = require('stripe').default || require('stripe');
}
catch (e) {
}
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.razorpay = null;
        this.stripe = null;
        const rzpKey = this.config.get('RAZORPAY_KEY_ID');
        const rzpSecret = this.config.get('RAZORPAY_KEY_SECRET');
        if (rzpKey && rzpSecret && Razorpay) {
            try {
                this.razorpay = new Razorpay({ key_id: rzpKey, key_secret: rzpSecret });
                this.logger.log('Initialized Razorpay client');
            }
            catch (e) {
                this.logger.warn('Failed to initialize Razorpay:', e.message);
            }
        }
        const stripeKey = this.config.get('STRIPE_SECRET_KEY');
        if (stripeKey && Stripe) {
            try {
                this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
                this.logger.log('Initialized Stripe client');
            }
            catch (e) {
                this.logger.warn('Failed to initialize Stripe:', e.message);
            }
        }
    }
    async createPaymentOrder(amountInMinorUnit, currency = 'INR') {
        if (this.razorpay) {
            try {
                const order = await this.razorpay.orders.create({
                    amount: amountInMinorUnit,
                    currency,
                    receipt: `rcpt_${Date.now()}`,
                });
                return { provider: 'razorpay', order };
            }
            catch (error) {
                this.logger.warn('Razorpay order creation failed, falling back to mock:', error.message);
            }
        }
        if (this.stripe) {
            try {
                const paymentIntent = await this.stripe.paymentIntents.create({
                    amount: amountInMinorUnit,
                    currency: currency.toLowerCase(),
                    automatic_payment_methods: { enabled: true },
                });
                return { provider: 'stripe', order: paymentIntent };
            }
            catch (error) {
                this.logger.warn('Stripe payment intent creation failed, falling back to mock:', error.message);
            }
        }
        this.logger.warn('No payment provider configured or all failed, returning mock order');
        return { provider: 'mock', order: { id: `mock_${Date.now()}`, amount: amountInMinorUnit, currency } };
    }
    verifyRazorpaySignature(rawBody, signature) {
        const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
        if (!secret || !signature)
            return false;
        const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
        const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
        return expected === signature;
    }
    constructStripeEvent(rawBody, signature) {
        const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!secret || !signature || !this.stripe)
            return null;
        try {
            return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
        }
        catch (e) {
            this.logger.warn(`Stripe webhook validation failed: ${e.message}`);
            return null;
        }
    }
    parseWebhook(payload) {
        const fromBody = {
            txId: payload?.txId,
            userId: payload?.userId,
            paymentId: payload?.paymentId,
            orderId: payload?.orderId,
            status: payload?.status,
        };
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