import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlacklistedTokens1784168332272 implements MigrationInterface {
  name = 'CreateBlacklistedTokens1784168332272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blacklisted_tokens" (
        "id" SERIAL NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blacklisted_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blacklisted_tokens_tokenHash" UNIQUE ("tokenHash")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_blacklisted_tokens_expiresAt" ON "blacklisted_tokens" ("expiresAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_blacklisted_tokens_expiresAt"`);
    await queryRunner.query(`DROP TABLE "blacklisted_tokens"`);
  }
}
