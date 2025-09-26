"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHealth() {
        return {
            message: 'Gold Investment Platform API is running successfully! 🚀',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };
    }
    getStatus() {
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        return {
            status: 'healthy',
            uptime: Math.floor(uptime),
            memory: {
                used: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
                total: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
                external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
                unit: 'MB'
            },
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map