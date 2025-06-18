import * as dotenv from 'dotenv';
import createServer from './interfaces/http/server';
import config from './config';
// import { runMigrations } from './shared/utils/drizzle-migrator';

dotenv.config();

async function bootstrap() {
  // Run database migrations
  // await runMigrations();

  // Create and start server
  const app = createServer();

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${config.port}`);
  });
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
