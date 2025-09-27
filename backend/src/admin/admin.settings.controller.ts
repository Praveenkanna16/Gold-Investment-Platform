import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserRole } from '../common/enums/user-role.enum'
import { AdminSettings } from './entities/admin-settings.entity'

@ApiTags('Admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(
    @InjectRepository(AdminSettings) private readonly repo: Repository<AdminSettings>,
  ) {}

  private async getOrCreateDefault(): Promise<AdminSettings> {
    let s = await this.repo.findOne({ where: { id: 'default' } })
    if (!s) {
      s = this.repo.create({
        id: 'default',
        maintenanceMode: false,
        minBuyAmount: 10,
        priceSource: 'live',
        manualPrice: null,
        features: { buy: true, sell: true, sip: true, admin: true },
        banner: { show: false, text: '', type: 'info' },
        trust: { partnerName: '', purity: '24K 99.9', insured: true },
        fees: { spreadBps: 0, convenienceFeeBps: 0, gstRate: 3 },
        disclosures: {},
      })
      await this.repo.save(s)
    }
    return s
  }

  @Get()
  @ApiOperation({ summary: 'Fetch admin settings (public)' })
  async getSettings() {
    return this.getOrCreateDefault()
  }

  @Patch()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update admin settings (admin only)' })
  async patchSettings(@Body() patch: Partial<AdminSettings>) {
    const s = await this.getOrCreateDefault()
    const next = this.repo.merge(s, patch)
    return this.repo.save(next)
  }
}
