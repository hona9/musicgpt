import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  node_env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 8000,
  database_url: process.env.DATABASE_URL!,
  cors_origin: process.env.CORS_ORIGIN ?? "*",
} as const;
