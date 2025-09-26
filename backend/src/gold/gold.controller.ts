import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GoldService } from './gold.service';

@ApiTags('Gold')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('gold')
export class GoldController {
  constructor(private readonly goldService: GoldService) {}

  @Get('balance')
  @ApiOperation({ summary: "Fetch user's gold balance" })
  async balance(@CurrentUser() user: any) {
    return this.goldService.getBalance(user.id);
  }

  @Get('price')
  @ApiOperation({ summary: 'Fetch current gold price (active)' })
  async price() {
    return this.goldService.getActivePrice();
  }

  @Post('buy')
  @ApiOperation({ summary: 'Initiate buy gold transaction and create payment order' })
  async buy(@CurrentUser() user: any, @Body() body: { amount: number }) {
    return this.goldService.initiateBuy(user.id, Number(body.amount));
  }
}
