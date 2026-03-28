import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';
import 'dotenv/config';

type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as {
  pool?: Pool;
  db?: Db;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  });

export const db = globalForDb.db ?? drizzle(pool, { schema });

globalForDb.pool = pool;
globalForDb.db = db;
