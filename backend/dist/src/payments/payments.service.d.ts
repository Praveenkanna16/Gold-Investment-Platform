import { ConfigService } from '@nestjs/config';
export declare class PaymentsService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    private get phonepeConfig();
    private buildPhonePeHeaders;
    private buildPhonePeStatusHeaders;
    createPaymentOrder(amountInMinorUnit: number, currency?: string, meta?: {
        txId?: string;
        userId?: string;
    }): Promise<{
        provider: string;
        order: {
            id: string;
            amount: number;
            currency: string;
            redirectUrl?: undefined;
            merchantTransactionId?: undefined;
        };
    } | {
        provider: string;
        order: {
            redirectUrl: any;
            merchantTransactionId: string;
            id?: undefined;
            amount?: undefined;
            currency?: undefined;
        };
    }>;
    checkPhonePeStatus(merchantTransactionId: string): Promise<{
        status: 'success' | 'failed' | 'pending';
        transactionId?: string;
    }>;
    verifyRazorpaySignature(_rawBody: Buffer | string, _signature: string | undefined): boolean;
    constructStripeEvent(_rawBody: Buffer, _signature: string | undefined): any | null;
    parseWebhook(payload: any): {
        txId?: string;
        userId?: string;
        paymentId?: string;
        orderId?: string;
        status?: 'success' | 'failed';
    };
}
