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
exports.AdminSIPController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const sip_plan_entity_1 = require("../gold/entities/sip-plan.entity");
const user_entity_1 = require("../users/entities/user.entity");
let AdminSIPController = class AdminSIPController {
    constructor(sipRepo, userRepo) {
        this.sipRepo = sipRepo;
        this.userRepo = userRepo;
    }
    async list(status, frequency, search) {
        const where = {};
        if (status)
            where.status = status;
        if (frequency)
            where.frequency = frequency;
        const items = await this.sipRepo.find({ where, order: { createdAt: 'DESC' } });
        if (search) {
            const userIds = Array.from(new Set(items.map(i => i.userId)));
            const users = await this.userRepo.find({ where: userIds.map(id => ({ id })) });
            const map = new Map(users.map(u => [u.id, u]));
            const withUser = items.map(i => ({ ...i, user: map.get(i.userId) }));
            return withUser.filter(i => i.user?.email?.toLowerCase().includes(search.toLowerCase()));
        }
        return items;
    }
    async pause(id) {
        const sip = await this.sipRepo.findOne({ where: { id } });
        if (!sip)
            return null;
        sip.status = 'paused';
        return this.sipRepo.save(sip);
    }
    async resume(id) {
        const sip = await this.sipRepo.findOne({ where: { id } });
        if (!sip)
            return null;
        sip.status = 'active';
        return this.sipRepo.save(sip);
    }
    async remove(id) {
        await this.sipRepo.delete({ id });
        return { ok: true };
    }
};
exports.AdminSIPController = AdminSIPController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List SIP plans with filters' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('frequency')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminSIPController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSIPController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSIPController.prototype, "resume", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSIPController.prototype, "remove", null);
exports.AdminSIPController = AdminSIPController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/sip'),
    __param(0, (0, typeorm_1.InjectRepository)(sip_plan_entity_1.SIPPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminSIPController);
//# sourceMappingURL=admin.sip.controller.js.map