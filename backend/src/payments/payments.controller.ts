import { Body, Controller, Headers, Post, Req, BadRequestException, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { TransactionStatus } from '../common/enums/transaction-status.enum';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactions: TransactionsService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Payment provider webhook (test mode)' })
  async webhook(@Body() payload: any, @Headers() headers: any, @Req() req: any) {
    const rawBody: Buffer = req.rawBody || Buffer.from(JSON.stringify(payload));

    // Stripe verification
    const stripeSig = headers['stripe-signature'];
    if (stripeSig) {
      const event = this.paymentsService.constructStripeEvent(rawBody, stripeSig);
      if (!event) throw new BadRequestException('Invalid Stripe signature');
      const data = event.data?.object as any;
      const txId = data?.metadata?.txId;
      const userId = data?.metadata?.userId;
      const status = data?.status === 'succeeded' ? 'success' : 'failed';
      await this.handleFinalize(txId, userId, status, data?.id, data?.id, 'stripe');
      return { received: true };
    }

    // Razorpay verification (legacy)
    const rzpSig = headers['x-razorpay-signature'];
    if (rzpSig) {
      const ok = this.paymentsService.verifyRazorpaySignature(rawBody, rzpSig);
      if (!ok) throw new BadRequestException('Invalid Razorpay signature');
      const parsed = this.paymentsService.parseWebhook(payload);
      await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'razorpay');
      return { received: true };
    }

    // PhonePe webhook (verify by fetching status from PhonePe)
    if (payload?.merchantTransactionId || payload?.transactionId || payload?.code) {
      const mtid = payload?.merchantTransactionId || payload?.orderId || payload?.transactionId;
      const statusResp = await this.paymentsService.checkPhonePeStatus(mtid);
      const tx = await this.transactions.findById(mtid);
      const userId = tx?.userId || payload?.merchantUserId;
      if (tx && userId) {
        await this.handleFinalize(
          mtid,
          userId,
          statusResp.status === 'success' ? 'success' : statusResp.status === 'failed' ? 'failed' : undefined,
          statusResp.transactionId,
          mtid,
          'phonepe',
        );
      }
      return { received: true };
    }

    // Fallback (dev/mock)
    const parsed = this.paymentsService.parseWebhook(payload);
    await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'mock');
    return { received: true };
  }

  @Get('phonepe/redirect')
  @ApiOperation({ summary: 'PhonePe redirect endpoint to finalize and forward to frontend' })
  async phonepeRedirect(@Query() query: any, @Res() res: any) {
    const mtid = query?.merchantTransactionId || query?.transactionId || query?.mtid;
    if (!mtid) {
      return res.status(400).json({ message: 'Missing merchantTransactionId' });
    }

    const statusResp = await this.paymentsService.checkPhonePeStatus(mtid);
    const tx = await this.transactions.findById(mtid);
    const userId = tx?.userId;
    if (tx && userId && statusResp.status !== 'pending') {
      await this.handleFinalize(
        mtid,
        userId,
        statusResp.status === 'success' ? 'success' : 'failed',
        statusResp.transactionId,
        mtid,
        'phonepe',
      );
    }

    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const redirectUrl = `${frontend}/?payment=${statusResp.status}`;
    return res.redirect(302, redirectUrl);
  }

  private async handleFinalize(
    txId?: string,
    userId?: string,
    status?: 'success' | 'failed',
    paymentId?: string,
    orderId?: string,
    provider?: string,
  ) {
    if (!txId || !userId) return;
    const tx = await this.transactions.findById(txId);
    if (!tx) return;
    if (status === 'success') {
      await this.transactions.update(txId, {
        status: TransactionStatus.COMPLETED,
        paymentId,
        paymentOrderId: orderId,
        paymentSignature: provider,
        completedAt: new Date(),
      });
      await this.users.incrementGoldBalance(userId, Number(tx.goldQuantity));
    } else if (status === 'failed') {
      await this.transactions.update(txId, {
        status: TransactionStatus.FAILED,
        paymentId,
        paymentOrderId: orderId,
        paymentSignature: provider,
      });
    }
  }
}
