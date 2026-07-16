import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1784169483615 implements MigrationInterface {
  name = 'CreateRefreshTokens1784169483615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" SERIAL NOT NULL,
        "tokenHash" character varying NOT NULL,
        "userId" integer NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_refresh_tokens_tokenHash" UNIQUE ("tokenHash"),
        CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_expiresAt" ON "refresh_tokens" ("expiresAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_expiresAt"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
