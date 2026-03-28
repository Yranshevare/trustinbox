import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: "local.db",
  },
  verbose: true,
} satisfies Config;
