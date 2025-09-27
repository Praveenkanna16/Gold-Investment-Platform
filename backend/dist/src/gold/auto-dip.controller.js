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
exports.GoldAutoDipController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const auto_dip_rule_entity_1 = require("./entities/auto-dip-rule.entity");
let GoldAutoDipController = class GoldAutoDipController {
    constructor(repo) {
        this.repo = repo;
    }
    async list(user) {
        return this.repo.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } });
    }
    async create(user, body) {
        const rule = this.repo.create({
            userId: user.id,
            triggerType: body.triggerType || 'price_drop_absolute',
            thresholdValue: Number(body.thresholdValue || 50),
            buyAmountInINR: Math.max(10, Number(body.buyAmountInINR || 200)),
            cooldownHours: Number(body.cooldownHours || 24),
            status: 'active',
            lastTriggeredAt: null,
        });
        return this.repo.save(rule);
    }
    async update(user, id, patch) {
        const rule = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!rule)
            return null;
        const next = this.repo.merge(rule, {
            triggerType: patch.triggerType ?? rule.triggerType,
            thresholdValue: patch.thresholdValue ?? rule.thresholdValue,
            buyAmountInINR: patch.buyAmountInINR ?? rule.buyAmountInINR,
            cooldownHours: patch.cooldownHours ?? rule.cooldownHours,
            status: patch.status ?? rule.status,
        });
        return this.repo.save(next);
    }
    async remove(user, id) {
        const rule = await this.repo.findOne({ where: { id, userId: user.id } });
        if (!rule)
            return null;
        await this.repo.delete({ id });
        return { ok: true };
    }
};
exports.GoldAutoDipController = GoldAutoDipController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List Auto-Dip rules for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoldAutoDipController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create Auto-Dip rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoldAutoDipController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Auto-Dip rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GoldAutoDipController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Auto-Dip rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GoldAutoDipController.prototype, "remove", null);
exports.GoldAutoDipController = GoldAutoDipController = __decorate([
    (0, swagger_1.ApiTags)('Gold - AutoDip'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('gold/auto-dip'),
    __param(0, (0, typeorm_1.InjectRepository)(auto_dip_rule_entity_1.AutoDipRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GoldAutoDipController);
//# sourceMappingURL=auto-dip.controller.js.map