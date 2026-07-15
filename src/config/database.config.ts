import * as path from 'path';
import { DataSourceOptions } from 'typeorm';

export function databaseConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'medium_clone',
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [
      path.join(__dirname, '..', 'database', 'migrations', '*.{ts,js}'),
    ],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  };
}
