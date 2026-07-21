import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../utils/test-app';
import { resetDatabase } from '../utils/database.util';
import { seedCommentFixture, SeededData } from '../utils/seed.util';

describe('Comments (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let fixture: SeededData;

  const commentsUrl = (slug: string) => `/articles/${slug}/comments`;

  const createComment = (
    slug: string,
    token: string,
    body: string,
  ): request.Test =>
    request(app.getHttpServer() as App)
      .post(commentsUrl(slug))
      .set('Authorization', `Bearer ${token}`)
      .send({ body });

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // Reset the database and re-seed fresh fake data before every test case so
  // each test runs against a deterministic, isolated state.
  beforeEach(async () => {
    await resetDatabase(dataSource);
    fixture = await seedCommentFixture(app);
  });

  describe('POST /articles/:slug/comments', () => {
    it('creates a comment and returns it with the author profile', async () => {
      const response = await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'His name was my name too.',
      ).expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number),
        body: 'His name was my name too.',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: {
          username: fixture.commenter.username,
          bio: null,
          image: null,
        },
      });

      // Verify the full flow persisted the comment: it comes back on GET.
      const list = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .expect(200);
      expect(list.body.comments).toHaveLength(1);
      expect(list.body.comments[0].id).toBe(response.body.id);
    });

    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer() as App)
        .post(commentsUrl(fixture.articleSlug))
        .send({ body: 'no token' })
        .expect(401);
    });

    it('returns 404 when the article does not exist', async () => {
      await createComment(
        'non-existent-slug',
        fixture.commenter.accessToken,
        'hello',
      ).expect(404);
    });

    it('returns 400 when the body is empty (validation)', async () => {
      await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        '',
      ).expect(400);
    });
  });

  describe('GET /articles/:slug/comments', () => {
    it('returns comments in ascending creation order with pagination meta', async () => {
      await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'first comment',
      ).expect(201);
      await createComment(
        fixture.articleSlug,
        fixture.author.accessToken,
        'second comment',
      ).expect(201);

      const response = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .expect(200);

      expect(response.body.comments.map((c: { body: string }) => c.body)).toEqual(
        ['first comment', 'second comment'],
      );
      expect(response.body.meta).toEqual({
        totalItems: 2,
        limit: 20,
        offset: 0,
        page: 1,
        totalPages: 1,
      });
    });

    it('honours limit and offset query parameters', async () => {
      for (const body of ['c1', 'c2', 'c3']) {
        await createComment(
          fixture.articleSlug,
          fixture.commenter.accessToken,
          body,
        ).expect(201);
      }

      const response = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .query({ limit: 1, offset: 1 })
        .expect(200);

      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].body).toBe('c2');
      expect(response.body.meta).toEqual({
        totalItems: 3,
        limit: 1,
        offset: 1,
        page: 2,
        totalPages: 3,
      });
    });

    it('returns an empty list when there are no comments', async () => {
      const response = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .expect(200);

      expect(response.body.comments).toEqual([]);
      expect(response.body.meta.totalItems).toBe(0);
    });

    it('returns 404 when the article does not exist', async () => {
      await request(app.getHttpServer() as App)
        .get(commentsUrl('non-existent-slug'))
        .expect(404);
    });
  });

  describe('DELETE /articles/:slug/comments/:id', () => {
    const deleteComment = (slug: string, id: number, token: string) =>
      request(app.getHttpServer() as App)
        .delete(`${commentsUrl(slug)}/${id}`)
        .set('Authorization', `Bearer ${token}`);

    it('lets the comment author delete their own comment', async () => {
      const created = await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'to be deleted',
      ).expect(201);

      await deleteComment(
        fixture.articleSlug,
        created.body.id,
        fixture.commenter.accessToken,
      ).expect(204);

      // Verify it is really gone from the database via the full read flow.
      const list = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .expect(200);
      expect(list.body.comments).toHaveLength(0);
    });

    it('lets the article author delete another user comment', async () => {
      const created = await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'commenter comment',
      ).expect(201);

      await deleteComment(
        fixture.articleSlug,
        created.body.id,
        fixture.author.accessToken,
      ).expect(204);
    });

    it('forbids an unrelated user from deleting a comment (403)', async () => {
      const created = await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'commenter comment',
      ).expect(201);

      await deleteComment(
        fixture.articleSlug,
        created.body.id,
        fixture.stranger.accessToken,
      ).expect(403);

      // The comment must still exist after a forbidden delete attempt.
      const list = await request(app.getHttpServer() as App)
        .get(commentsUrl(fixture.articleSlug))
        .expect(200);
      expect(list.body.comments).toHaveLength(1);
    });

    it('rejects an unauthenticated delete with 401', async () => {
      const created = await createComment(
        fixture.articleSlug,
        fixture.commenter.accessToken,
        'commenter comment',
      ).expect(201);

      await request(app.getHttpServer() as App)
        .delete(`${commentsUrl(fixture.articleSlug)}/${created.body.id}`)
        .expect(401);
    });

    it('returns 404 when deleting a non-existent comment', async () => {
      await deleteComment(
        fixture.articleSlug,
        999999,
        fixture.author.accessToken,
      ).expect(404);
    });
  });
});
