import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

/**
 * A conexão é criada apenas no momento de uso. Isso permite que `next build`
 * termine sem uma URL local de banco, mas o sistema continua exigindo
 * DATABASE_URL em desenvolvimento e produção.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não foi definida. Crie .env.local usando .env.example antes de iniciar o sistema.",
    );
  }

  return drizzle({
    client: neon(databaseUrl),
    schema,
  });
}
