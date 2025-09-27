"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const user_entity_1 = require("../users/entities/user.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const admin_settings_entity_1 = require("./entities/admin-settings.entity");
const admin_settings_controller_1 = require("./admin.settings.controller");
const sip_plan_entity_1 = require("../gold/entities/sip-plan.entity");
const auto_dip_rule_entity_1 = require("../gold/entities/auto-dip-rule.entity");
const admin_sip_controller_1 = require("./admin.sip.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, transaction_entity_1.Transaction, admin_settings_entity_1.AdminSettings, sip_plan_entity_1.SIPPlan, auto_dip_rule_entity_1.AutoDipRule])],
        controllers: [admin_controller_1.AdminController, admin_settings_controller_1.AdminSettingsController, admin_sip_controller_1.AdminSIPController],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map