import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Charge .env.local en priorité (Next.js convention), puis .env
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
