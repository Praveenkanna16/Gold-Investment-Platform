import { Controller, Get, Query, UseGuards, Post, Param, Delete } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserRole } from '../common/enums/user-role.enum'
import { SIPPlan } from '../gold/entities/sip-plan.entity'
import { User } from '../users/entities/user.entity'

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/sip')
export class AdminSIPController {
  constructor(
    @InjectRepository(SIPPlan) private readonly sipRepo: Repository<SIPPlan>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List SIP plans with filters' })
  async list(
    @Query('status') status?: string,
    @Query('frequency') frequency?: string,
    @Query('search') search?: string,
  ) {
    const where: any = {}
    if (status) where.status = status
    if (frequency) where.frequency = frequency

    const items = await this.sipRepo.find({ where, order: { createdAt: 'DESC' } })

    if (search) {
      // hydrate user emails and filter by email contains
      const userIds = Array.from(new Set(items.map(i => i.userId)))
      const users = await this.userRepo.find({ where: userIds.map(id => ({ id })) })
      const map = new Map(users.map(u => [u.id, u]))
      const withUser = items.map(i => ({ ...i, user: map.get(i.userId) }))
      return withUser.filter(i => i.user?.email?.toLowerCase().includes(search.toLowerCase()))
    }

    return items
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string) {
    const sip = await this.sipRepo.findOne({ where: { id } })
    if (!sip) return null
    sip.status = 'paused'
    return this.sipRepo.save(sip)
  }

  @Post(':id/resume')
  async resume(@Param('id') id: string) {
    const sip = await this.sipRepo.findOne({ where: { id } })
    if (!sip) return null
    sip.status = 'active'
    return this.sipRepo.save(sip)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.sipRepo.delete({ id })
    return { ok: true }
  }
}
