try {
  require("dotenv").config({ path: "../../.env.local" });
} catch (error) {}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL,
  directURL: process.env.DIRECT_URL,
  node_env: process.env.NODE_ENV,
  server_port: process.env.SERVER_PORT,
  better_auth_url: process.env.BETTER_AUTH_URL,
  better_auth_secret: process.env.BETTER_AUTH_SECRET,
};
