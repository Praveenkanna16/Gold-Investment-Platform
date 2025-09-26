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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldPrice = void 0;
const typeorm_1 = require("typeorm");
let GoldPrice = class GoldPrice {
    get pricePerKg() {
        return this.pricePerGram * 1000;
    }
    get pricePerTola() {
        return this.pricePerGram * 11.664;
    }
};
exports.GoldPrice = GoldPrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GoldPrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], GoldPrice.prototype, "pricePerGram", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], GoldPrice.prototype, "pricePerOunce", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'INR' }),
    __metadata("design:type", String)
], GoldPrice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'live' }),
    __metadata("design:type", String)
], GoldPrice.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GoldPrice.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GoldPrice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GoldPrice.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], GoldPrice.prototype, "isActive", void 0);
exports.GoldPrice = GoldPrice = __decorate([
    (0, typeorm_1.Entity)('gold_prices')
], GoldPrice);
//# sourceMappingURL=gold-price.entity.js.map