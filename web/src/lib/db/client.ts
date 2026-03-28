import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index";

declare global {
  var _client: ReturnType<typeof createClient> | undefined;
  var _drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const client = global._client ?? createClient({
  url: "file:local.db",
});

if (!global._client) global._client = client;

const db = global._drizzleDb ?? drizzle(client, { schema });

if (!global._drizzleDb) global._drizzleDb = db;

export { db };
