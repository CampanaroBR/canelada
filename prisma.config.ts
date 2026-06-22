import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    // Migrations no Neon precisam de conexão DIRETA (unpooled). Fallback entre os nomes comuns.
    directUrl:
      process.env["DIRECT_URL"] ||
      process.env["DATABASE_URL_UNPOOLED"] ||
      process.env["DATABASE_URL"]!,
  },
});
