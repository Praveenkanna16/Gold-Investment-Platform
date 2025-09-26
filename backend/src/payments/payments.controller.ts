import { Body, Controller, Headers, Post, Req, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { TransactionStatus } from '../common/enums/transaction-status.enum';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactions: TransactionsService,
    private readonly users: UsersService,
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

    // Razorpay verification
    const rzpSig = headers['x-razorpay-signature'];
    if (rzpSig) {
      const ok = this.paymentsService.verifyRazorpaySignature(rawBody, rzpSig);
      if (!ok) throw new BadRequestException('Invalid Razorpay signature');
      const parsed = this.paymentsService.parseWebhook(payload);
      await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'razorpay');
      return { received: true };
    }

    // Fallback (dev/mock)
    const parsed = this.paymentsService.parseWebhook(payload);
    await this.handleFinalize(parsed.txId, parsed.userId, parsed.status, parsed.paymentId, parsed.orderId, 'mock');
    return { received: true };
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
