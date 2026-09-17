import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// The Neon Marketplace integration provisioned this project's Postgres vars
// under a "STORAGE_DATABASE_" prefix (see Vercel Storage tab), not the plain
// DATABASE_URL name — reference the actual provisioned var here in one place.
const CONNECTION_STRING = process.env.STORAGE_DATABASE_DATABASE_URL;

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

// Lazy, plain-function initialization (not a Proxy) — Next.js evaluates
// top-level module code at build time, when env vars may not be set yet,
// and Proxy wrappers around the client break libraries that introspect it.
export function getDb(): Db {
  if (!_db) {
    if (!CONNECTION_STRING) {
      throw new Error("STORAGE_DATABASE_DATABASE_URL is not set");
    }
    const sql = neon(CONNECTION_STRING);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
