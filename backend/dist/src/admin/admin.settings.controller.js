"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSettingsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const admin_settings_entity_1 = require("./entities/admin-settings.entity");
let AdminSettingsController = class AdminSettingsController {
    constructor(repo) {
        this.repo = repo;
    }
    async getOrCreateDefault() {
        let s = await this.repo.findOne({ where: { id: 'default' } });
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
            });
            await this.repo.save(s);
        }
        return s;
    }
    async getSettings() {
        return this.getOrCreateDefault();
    }
    async patchSettings(patch) {
        const s = await this.getOrCreateDefault();
        const next = this.repo.merge(s, patch);
        return this.repo.save(next);
    }
};
exports.AdminSettingsController = AdminSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch admin settings (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update admin settings (admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettingsController.prototype, "patchSettings", null);
exports.AdminSettingsController = AdminSettingsController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin/settings'),
    __param(0, (0, typeorm_1.InjectRepository)(admin_settings_entity_1.AdminSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminSettingsController);
//# sourceMappingURL=admin.settings.controller.js.map