import * as dotenv from 'dotenv';
import createServer from './interfaces/http/server';
import config from './config';

dotenv.config();

/**
 * @description Bootstraps the backend server.
 * @function bootstrap
 * @async
 * @returns {Promise<void>} A promise that resolves when the server is running.
 */
async function bootstrap() {
  const app = createServer();

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
