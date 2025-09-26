import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1696000001000 implements MigrationInterface {
  name = 'AddIndexes1696000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Performance indexes for common queries
    await queryRunner.query(`CREATE INDEX "IDX_transactions_userId" ON "transactions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_status" ON "transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_createdAt" ON "transactions" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_type" ON "transactions" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_gold_prices_isActive" ON "gold_prices" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_gold_prices_createdAt" ON "gold_prices" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
