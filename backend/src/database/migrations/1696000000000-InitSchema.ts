import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1696000000000 implements MigrationInterface {
  name = 'InitSchema1696000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "email" character varying NOT NULL,
      "firstName" character varying NOT NULL,
      "lastName" character varying NOT NULL,
      "password" character varying NOT NULL,
      "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
      "goldBalance" numeric(10,4) NOT NULL DEFAULT '0',
      "phone" character varying,
      "dateOfBirth" date,
      "isActive" boolean NOT NULL DEFAULT true,
      "isEmailVerified" boolean NOT NULL DEFAULT false,
      "lastLoginAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_users_email" UNIQUE ("email"),
      CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "gold_prices" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "pricePerGram" numeric(10,2) NOT NULL,
      "pricePerOunce" numeric(10,2) NOT NULL,
      "currency" character varying NOT NULL DEFAULT 'INR',
      "source" character varying NOT NULL DEFAULT 'live',
      "metadata" json,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "isActive" boolean NOT NULL DEFAULT true,
      CONSTRAINT "PK_gold_prices_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('buy', 'sell')`);
    await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')`);
    await queryRunner.query(`CREATE TABLE "transactions" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "userId" uuid NOT NULL,
      "type" "public"."transactions_type_enum" NOT NULL,
      "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending',
      "amount" numeric(12,2) NOT NULL,
      "goldQuantity" numeric(10,4) NOT NULL,
      "goldPricePerGram" numeric(10,2) NOT NULL,
      "paymentId" character varying,
      "paymentOrderId" character varying,
      "paymentSignature" character varying,
      "notes" text,
      "metadata" json,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      "completedAt" TIMESTAMP,
      CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_transactions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "gold_prices"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
