import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

export interface SeededUser {
  id: number;
  email: string;
  username: string;
  password: string;
  accessToken: string;
}

export interface SeededData {
  /** Author of the seeded article. */
  author: SeededUser;
  /** A second, unrelated user (writes comments). */
  commenter: SeededUser;
  /** A third user with no relationship to the article or comments. */
  stranger: SeededUser;
  /** Slug of the article seeded and owned by `author`. */
  articleSlug: string;
}

let counter = 0;

/**
 * Registers a user through the real /auth/register endpoint and returns the
 * created user together with a valid access token.
 */
export async function registerUser(
  app: INestApplication,
  overrides: Partial<{ email: string; username: string; password: string }> = {},
): Promise<SeededUser> {
  counter += 1;
  const password = overrides.password ?? 'password123';
  const username = overrides.username ?? `user_${counter}`;
  const email = overrides.email ?? `${username}@example.com`;

  const response = await request(app.getHttpServer() as App)
    .post('/auth/register')
    .send({ email, username, password })
    .expect(201);

  return {
    id: response.body.user.id,
    email,
    username,
    password,
    accessToken: response.body.accessToken,
  };
}

/**
 * Seeds a full, realistic fixture for comment tests by driving the real HTTP
 * endpoints: three users plus one article owned by the first user.
 */
export async function seedCommentFixture(
  app: INestApplication,
): Promise<SeededData> {
  const author = await registerUser(app, { username: 'article_author' });
  const commenter = await registerUser(app, { username: 'commenter' });
  const stranger = await registerUser(app, { username: 'stranger' });

  const articleResponse = await request(app.getHttpServer() as App)
    .post('/articles')
    .set('Authorization', `Bearer ${author.accessToken}`)
    .send({
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: 'You have to believe',
      tagList: ['dragons', 'training'],
    })
    .expect(201);

  return {
    author,
    commenter,
    stranger,
    articleSlug: articleResponse.body.slug,
  };
}
