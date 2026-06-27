import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O Next.js usa .env.local. O Drizzle não o lê automaticamente,
// então carregamos primeiro esse arquivo e, como alternativa, .env.
config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não foi definida. Crie o arquivo .env.local usando .env.example e informe a URL do Neon.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
