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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../users/entities/user.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AdminController = class AdminController {
    constructor(users, txs) {
        this.users = users;
        this.txs = txs;
    }
    async listUsers(page = 1, limit = 20, search, role) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.users.createQueryBuilder('user');
        if (search) {
            queryBuilder.where('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
        }
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        const [users, total] = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const sanitized = users.map((u) => {
            const { password, ...rest } = u;
            return rest;
        });
        return {
            data: sanitized,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async listTransactions(page = 1, limit = 20, status, type) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.txs.createQueryBuilder('tx')
            .leftJoinAndSelect('tx.user', 'user');
        if (status) {
            queryBuilder.andWhere('tx.status = :status', { status });
        }
        if (type) {
            queryBuilder.andWhere('tx.type = :type', { type });
        }
        const [transactions, total] = await queryBuilder
            .orderBy('tx.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data: transactions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users (admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: user_role_enum_1.UserRole }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all transactions (admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listTransactions", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminController);
//# sourceMappingURL=admin.controller.js.map