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
exports.GoldSIPController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const sip_plan_entity_1 = require("./entities/sip-plan.entity");
let GoldSIPController = class GoldSIPController {
    constructor(repo) {
        this.repo = repo;
    }
    async list(user) {
        return this.repo.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } });
    }
    async create(user, body) {
        const plan = this.repo.create({
            userId: user.id,
            amount: Math.max(10, Number(body.amount || body.amountInINR || 0)),
            frequency: body.frequency || 'daily',
            weeklyDay: body.weeklyDay ?? null,
            monthlyDay: body.monthlyDay ?? null,
            startDate: body.startDate ? new Date(body.startDate) : new Date(),
            status: 'active',
            nextRunAt: body.nextRunAt ? new Date(body.nextRunAt) : new Date(),
        });
        return this.repo.save(plan);
    }
    async update(user, id, patch) {
        const plan = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!plan)
            return null;
        const next = this.repo.merge(plan, {
            amount: patch.amount ?? plan.amount,
            frequency: patch.frequency ?? plan.frequency,
            weeklyDay: patch.weeklyDay ?? plan.weeklyDay,
            monthlyDay: patch.monthlyDay ?? plan.monthlyDay,
            status: patch.status ?? plan.status,
            nextRunAt: patch.nextRunAt ? new Date(patch.nextRunAt) : plan.nextRunAt,
        });
        return this.repo.save(next);
    }
    async pause(user, id) {
        const plan = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!plan)
            return null;
        plan.status = 'paused';
        return this.repo.save(plan);
    }
    async resume(user, id) {
        const plan = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!plan)
            return null;
        plan.status = 'active';
        return this.repo.save(plan);
    }
    async remove(user, id) {
        const plan = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!plan)
            return null;
        await this.repo.delete({ id });
        return { ok: true };
    }
};
exports.GoldSIPController = GoldSIPController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List SIP plans for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create SIP plan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update SIP plan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "resume", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoldSIPController.prototype, "remove", null);
exports.GoldSIPController = GoldSIPController = __decorate([
    (0, swagger_1.ApiTags)('Gold - SIP'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('gold/sip'),
    __param(0, (0, typeorm_1.InjectRepository)(sip_plan_entity_1.SIPPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GoldSIPController);
//# sourceMappingURL=sip.controller.js.map