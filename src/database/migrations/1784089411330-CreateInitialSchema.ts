import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1784089411330 implements MigrationInterface {
  name = 'CreateInitialSchema1784089411330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "bio" text,
        "image" character varying,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" SERIAL NOT NULL,
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying NOT NULL,
        "body" text NOT NULL,
        "tagList" text NOT NULL,
        "authorId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_articles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_articles_authorId" FOREIGN KEY ("authorId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL NOT NULL,
        "body" text NOT NULL,
        "articleId" integer NOT NULL,
        "authorId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_articleId" FOREIGN KEY ("articleId")
          REFERENCES "articles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_authorId" FOREIGN KEY ("authorId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_articles_authorId" ON "articles" ("authorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_articleId" ON "comments" ("articleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_authorId" ON "comments" ("authorId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_comments_authorId"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_articleId"`);
    await queryRunner.query(`DROP INDEX "IDX_articles_authorId"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
