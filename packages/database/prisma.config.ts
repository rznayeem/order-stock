import { defineConfig } from "prisma/config";
import { ENV } from "./src/config";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: ENV.databaseUrl!,
    directUrl: ENV.directURL || ENV.databaseUrl!,
  },
});
