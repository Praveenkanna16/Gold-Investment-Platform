import { MigrationInterface, QueryRunner } from 'typeorm'

export class AutomationAndSettings1696000002000 implements MigrationInterface {
  name = 'AutomationAndSettings1696000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // admin_settings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_settings" (
        "id" varchar(36) PRIMARY KEY,
        "maintenanceMode" boolean NOT NULL DEFAULT false,
        "minBuyAmount" integer NOT NULL DEFAULT 10,
        "priceSource" varchar NOT NULL DEFAULT 'live',
        "manualPrice" numeric,
        "features" TEXT,
        "banner" TEXT,
        "trust" TEXT,
        "fees" TEXT,
        "disclosures" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `)

    // sip_plans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sip_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "amount" integer NOT NULL,
        "frequency" varchar NOT NULL,
        "weeklyDay" smallint,
        "monthlyDay" smallint,
        "startDate" TIMESTAMP NOT NULL,
        "status" varchar NOT NULL DEFAULT 'active',
        "nextRunAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_sip_plans_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sip_plans_userId" ON "sip_plans" ("userId")`)

    // auto_dip_rules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auto_dip_rules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "triggerType" varchar NOT NULL,
        "thresholdValue" numeric NOT NULL,
        "buyAmountInINR" integer NOT NULL,
        "cooldownHours" integer NOT NULL DEFAULT 24,
        "lastTriggeredAt" TIMESTAMP,
        "status" varchar NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_auto_dip_rules_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_auto_dip_rules_userId" ON "auto_dip_rules" ("userId")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "auto_dip_rules"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "sip_plans"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_settings"`)
  }
}
