import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly config: ConfigService) {}

  private get phonepeConfig() {
    const merchantId = this.config.get<string>('PHONEPE_MERCHANT_ID');
    const saltKey = this.config.get<string>('PHONEPE_SALT_KEY');
    const saltIndex = this.config.get<string>('PHONEPE_SALT_INDEX') || '1';
    const baseUrl =
      this.config.get<string>('PHONEPE_BASE_URL') ||
      'https://api-preprod.phonepe.com/apis/pg-sandbox';
    const callbackUrl =
      this.config.get<string>('PHONEPE_CALLBACK_URL') ||
      `${this.config.get('API_BASE_URL', 'http://localhost:3000/api/v1')}/payments/webhook`;
    const redirectUrl =
      this.config.get<string>('PHONEPE_REDIRECT_URL') ||
      `${this.config.get('API_BASE_URL', 'http://localhost:3000/api/v1')}/payments/phonepe/redirect`;
    return { merchantId, saltKey, saltIndex, baseUrl, callbackUrl, redirectUrl };
  }

  private buildPhonePeHeaders(path: string, payloadBase64: string) {
    const { saltKey, saltIndex, merchantId } = this.phonepeConfig;
    const xVerify = crypto
      .createHash('sha256')
      .update(payloadBase64 + path + saltKey)
      .digest('hex');
    return {
      'Content-Type': 'application/json',
      'X-VERIFY': `${xVerify}###${saltIndex}`,
      'X-MERCHANT-ID': merchantId,
    } as Record<string, string>;
  }

  private buildPhonePeStatusHeaders(path: string) {
    const { saltKey, saltIndex, merchantId } = this.phonepeConfig;
    const xVerify = crypto
      .createHash('sha256')
      .update(path + saltKey)
      .digest('hex');
    return {
      'Content-Type': 'application/json',
      'X-VERIFY': `${xVerify}###${saltIndex}`,
      'X-MERCHANT-ID': merchantId,
    } as Record<string, string>;
  }

  async createPaymentOrder(
    amountInMinorUnit: number,
    currency = 'INR',
    meta?: { txId?: string; userId?: string },
  ) {
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
      const resp = await axios.post(
        `${baseUrl}${path}`,
        { request: payloadBase64 },
        { headers: this.buildPhonePeHeaders(path, payloadBase64) },
      );

      const url = resp?.data?.data?.instrumentResponse?.redirectInfo?.url;
      if (!url) {
        this.logger.warn(`PhonePe did not return redirect url, response code: ${resp?.data?.code}`);
        throw new Error('No redirect URL from PhonePe');
      }
      return { provider: 'phonepe', order: { redirectUrl: url, merchantTransactionId } };
    } catch (error: any) {
      this.logger.warn(`PhonePe order creation failed: ${error?.message}`);
      // Fallback mock for dev without keys or on failure
      return { provider: 'mock', order: { id: `mock_${Date.now()}`, amount: amountInMinorUnit, currency } };
    }
  }

  async checkPhonePeStatus(merchantTransactionId: string): Promise<{ status: 'success' | 'failed' | 'pending'; transactionId?: string }>{
    const { merchantId, baseUrl } = this.phonepeConfig;
    if (!merchantId) return { status: 'failed' };

    const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    try {
      const resp = await axios.get(`${baseUrl}${path}`, { headers: this.buildPhonePeStatusHeaders(path) });
      const code = resp?.data?.code || resp?.data?.data?.responseCode || resp?.data?.data?.state;
      const transactionId = resp?.data?.data?.transactionId;
      if (code === 'SUCCESS') return { status: 'success', transactionId };
      if (code === 'PENDING') return { status: 'pending' };
      return { status: 'failed' };
    } catch (e: any) {
      this.logger.warn(`PhonePe status check failed: ${e?.message}`);
      return { status: 'failed' };
    }
  }

  // Legacy stubs kept for backward compatibility with controller logic
  verifyRazorpaySignature(_rawBody: Buffer | string, _signature: string | undefined): boolean {
    return false;
  }

  constructStripeEvent(_rawBody: Buffer, _signature: string | undefined): any | null {
    return null;
  }

  parseWebhook(payload: any): {
    txId?: string;
    userId?: string;
    paymentId?: string;
    orderId?: string;
    status?: 'success' | 'failed';
  } {
    // Generic/custom body shape
    const fromBody = {
      txId: payload?.txId,
      userId: payload?.userId,
      paymentId: payload?.paymentId,
      orderId: payload?.orderId,
      status: payload?.status,
    } as any;

    // PhonePe style
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

    // Razorpay style (legacy)
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
