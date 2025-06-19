import { migrate } from 'drizzle-orm/node-postgres/migrator';
import db from '../../../db';
import path from 'path';

export const runMigrations = async () => {
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../../../migrations'),
    });
    // eslint-disable-next-line no-console
    console.log('Migrations completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', error);
    process.exit(1);
  }
};
