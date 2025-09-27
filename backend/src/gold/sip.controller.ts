import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { SIPPlan } from './entities/sip-plan.entity'

@ApiTags('Gold - SIP')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('gold/sip')
export class GoldSIPController {
  constructor(
    @InjectRepository(SIPPlan) private readonly repo: Repository<SIPPlan>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List SIP plans for current user' })
  async list(@CurrentUser() user: any) {
    return this.repo.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } })
  }

  @Post()
  @ApiOperation({ summary: 'Create SIP plan' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    const plan = this.repo.create({
      userId: user.id,
      amount: Math.max(10, Number(body.amount || body.amountInINR || 0)),
      frequency: body.frequency || 'daily',
      weeklyDay: body.weeklyDay ?? null,
      monthlyDay: body.monthlyDay ?? null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      status: 'active',
      nextRunAt: body.nextRunAt ? new Date(body.nextRunAt) : new Date(),
    })
    return this.repo.save(plan)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SIP plan' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() patch: any) {
    const plan = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!plan) return null
    const next = this.repo.merge(plan, {
      amount: patch.amount ?? plan.amount,
      frequency: patch.frequency ?? plan.frequency,
      weeklyDay: patch.weeklyDay ?? plan.weeklyDay,
      monthlyDay: patch.monthlyDay ?? plan.monthlyDay,
      status: patch.status ?? plan.status,
      nextRunAt: patch.nextRunAt ? new Date(patch.nextRunAt) : plan.nextRunAt,
    })
    return this.repo.save(next)
  }

  @Post(':id/pause')
  async pause(@CurrentUser() user: any, @Param('id') id: string) {
    const plan = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!plan) return null
    plan.status = 'paused'
    return this.repo.save(plan)
  }

  @Post(':id/resume')
  async resume(@CurrentUser() user: any, @Param('id') id: string) {
    const plan = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!plan) return null
    plan.status = 'active'
    return this.repo.save(plan)
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    const plan = await this.repo.findOne({ where: { id, userId: user.id } })
    if (!plan) return null
    await this.repo.delete({ id })
    return { ok: true }
  }
}
