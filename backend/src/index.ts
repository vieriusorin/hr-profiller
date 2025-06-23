import * as dotenv from 'dotenv';
import createServer from './interfaces/http/server';
import config from './config';

dotenv.config();

async function bootstrap() {
  const app = createServer();

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
