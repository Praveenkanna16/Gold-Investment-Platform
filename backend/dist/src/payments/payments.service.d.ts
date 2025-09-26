import { ConfigService } from '@nestjs/config';
export declare class PaymentsService {
    private readonly config;
    private readonly logger;
    private razorpay;
    private stripe;
    constructor(config: ConfigService);
    createPaymentOrder(amountInMinorUnit: number, currency?: string): Promise<{
        provider: string;
        order: any;
    }>;
    verifyRazorpaySignature(rawBody: Buffer | string, signature: string | undefined): boolean;
    constructStripeEvent(rawBody: Buffer, signature: string | undefined): any | null;
    parseWebhook(payload: any): {
        txId?: string;
        userId?: string;
        paymentId?: string;
        orderId?: string;
        status?: 'success' | 'failed';
    };
}
