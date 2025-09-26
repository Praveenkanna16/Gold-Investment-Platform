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
exports.GoldController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const gold_service_1 = require("./gold.service");
let GoldController = class GoldController {
    constructor(goldService) {
        this.goldService = goldService;
    }
    async balance(user) {
        return this.goldService.getBalance(user.id);
    }
    async price() {
        return this.goldService.getActivePrice();
    }
    async buy(user, body) {
        return this.goldService.initiateBuy(user.id, Number(body.amount));
    }
};
exports.GoldController = GoldController;
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: "Fetch user's gold balance" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoldController.prototype, "balance", null);
__decorate([
    (0, common_1.Get)('price'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch current gold price (active)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoldController.prototype, "price", null);
__decorate([
    (0, common_1.Post)('buy'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate buy gold transaction and create payment order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GoldController.prototype, "buy", null);
exports.GoldController = GoldController = __decorate([
    (0, swagger_1.ApiTags)('Gold'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('gold'),
    __metadata("design:paramtypes", [gold_service_1.GoldService])
], GoldController);
//# sourceMappingURL=gold.controller.js.map