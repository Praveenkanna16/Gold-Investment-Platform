import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch user transaction history' })
  async getMyTransactions(@CurrentUser() user: any) {
    return this.txService.findForUser(user.id);
  }
}
