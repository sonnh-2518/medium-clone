import * as path from 'path';
import { config as loadEnv } from 'dotenv';

/**
 * Loads the dedicated test environment before the Nest app (and its
 * ConfigModule) boots. `override: true` guarantees the test database is used
 * even if the shell already exported the development variables.
 *
 * Registered via `setupFiles` in test/jest-e2e.json so it runs once per test
 * file, before any module under test is imported.
 */
loadEnv({
  path: path.resolve(__dirname, '..', '.env.test'),
  override: true,
});
