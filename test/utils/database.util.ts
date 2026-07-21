import { DataSource } from 'typeorm';

/**
 * Resets the test database to a clean state before each test case.
 *
 * Truncates every table managed by TypeORM with `RESTART IDENTITY CASCADE` so
 * primary-key sequences also reset — each test starts from a deterministic,
 * empty database. Faster and more predictable than dropping/recreating the
 * schema on every test.
 */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  const tableNames = dataSource.entityMetadatas
    .map((metadata) => `"${metadata.tableName}"`)
    .join(', ');

  if (!tableNames) {
    return;
  }

  await dataSource.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
  );
}
