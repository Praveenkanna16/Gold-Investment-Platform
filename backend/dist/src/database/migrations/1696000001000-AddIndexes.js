"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIndexes1696000001000 = void 0;
class AddIndexes1696000001000 {
    constructor() {
        this.name = 'AddIndexes1696000001000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_transactions_userId" ON "transactions" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_status" ON "transactions" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_createdAt" ON "transactions" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_type" ON "transactions" ("type")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")`);
        await queryRunner.query(`CREATE INDEX "IDX_gold_prices_isActive" ON "gold_prices" ("isActive")`);
        await queryRunner.query(`CREATE INDEX "IDX_gold_prices_createdAt" ON "gold_prices" ("createdAt")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_gold_prices_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_gold_prices_isActive"`);
        await queryRunner.query(`DROP INDEX "IDX_users_isActive"`);
        await queryRunner.query(`DROP INDEX "IDX_users_role"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_type"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_status"`);
        await queryRunner.query(`DROP INDEX "IDX_transactions_userId"`);
    }
}
exports.AddIndexes1696000001000 = AddIndexes1696000001000;
//# sourceMappingURL=1696000001000-AddIndexes.js.map