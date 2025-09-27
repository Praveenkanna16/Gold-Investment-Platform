import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AutoDipRule } from './entities/auto-dip-rule.entity'

@ApiTags('Gold - AutoDip')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('gold/auto-dip')
export class GoldAutoDipController {
  constructor(
    @InjectRepository(AutoDipRule) private readonly repo: Repository<AutoDipRule>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List Auto-Dip rules for current user' })
  async list(@CurrentUser() user: any) {
    return this.repo.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } })
  }

  @Post()
  @ApiOperation({ summary: 'Create Auto-Dip rule' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    const rule = this.repo.create({
      userId: user.id,
      triggerType: body.triggerType || 'price_drop_absolute',
      thresholdValue: Number(body.thresholdValue || 50),
      buyAmountInINR: Math.max(10, Number(body.buyAmountInINR || 200)),
      cooldownHours: Number(body.cooldownHours || 24),
      status: 'active',
      lastTriggeredAt: null,
    })
    return this.repo.save(rule)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Auto-Dip rule' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() patch: any) {
    const rule = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!rule) return null
    const next = this.repo.merge(rule, {
      triggerType: patch.triggerType ?? rule.triggerType,
      thresholdValue: patch.thresholdValue ?? rule.thresholdValue,
      buyAmountInINR: patch.buyAmountInINR ?? rule.buyAmountInINR,
      cooldownHours: patch.cooldownHours ?? rule.cooldownHours,
      status: patch.status ?? rule.status,
    })
    return this.repo.save(next)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Auto-Dip rule' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const rule = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!rule) return null
    await this.repo.delete({ id })
    return { ok: true }
  }
}
