import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Dynamic imports for payment providers
let Razorpay: any;
let Stripe: any;

try {
  Razorpay = require('razorpay');
} catch (e) {
  // Razorpay not available
}

try {
  Stripe = require('stripe').default || require('stripe');
} catch (e) {
  // Stripe not available
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any = null;
  private stripe: any = null;

  constructor(private readonly config: ConfigService) {
    const rzpKey = this.config.get<string>('RAZORPAY_KEY_ID');
    const rzpSecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (rzpKey && rzpSecret && Razorpay) {
      try {
        this.razorpay = new Razorpay({ key_id: rzpKey, key_secret: rzpSecret });
        this.logger.log('Initialized Razorpay client');
      } catch (e) {
        this.logger.warn('Failed to initialize Razorpay:', e.message);
      }
    }

    const stripeKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey && Stripe) {
      try {
        this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        this.logger.log('Initialized Stripe client');
      } catch (e) {
        this.logger.warn('Failed to initialize Stripe:', e.message);
      }
    }
  }

  async createPaymentOrder(amountInMinorUnit: number, currency = 'INR') {
    if (this.razorpay) {
      try {
        const order = await this.razorpay.orders.create({
          amount: amountInMinorUnit,
          currency,
          receipt: `rcpt_${Date.now()}`,
        });
        return { provider: 'razorpay', order };
      } catch (error) {
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
      } catch (error) {
        this.logger.warn('Stripe payment intent creation failed, falling back to mock:', error.message);
      }
    }

    // Fallback mock for dev without keys
    this.logger.warn('No payment provider configured or all failed, returning mock order');
    return { provider: 'mock', order: { id: `mock_${Date.now()}`, amount: amountInMinorUnit, currency } };
  }

  verifyRazorpaySignature(rawBody: Buffer | string, signature: string | undefined): boolean {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret || !signature) return false;
    const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody as string);
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expected === signature;
  }

  constructStripeEvent(rawBody: Buffer, signature: string | undefined): any | null {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret || !signature || !this.stripe) return null;
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (e) {
      this.logger.warn(`Stripe webhook validation failed: ${(e as Error).message}`);
      return null;
    }
  }

  parseWebhook(payload: any): { txId?: string; userId?: string; paymentId?: string; orderId?: string; status?: 'success'|'failed' } {
    // Support multiple shapes (custom, Razorpay, Stripe metadata)
    const fromBody = {
      txId: payload?.txId,
      userId: payload?.userId,
      paymentId: payload?.paymentId,
      orderId: payload?.orderId,
      status: payload?.status,
    } as any;

    // Razorpay style
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
}
