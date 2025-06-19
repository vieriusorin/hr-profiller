import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// ✅ SINGLE SOURCE OF TRUTH: Database connection
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
export { schema };
