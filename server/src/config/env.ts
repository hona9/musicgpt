import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "REDIS_URL", "JWT_ACCESS_SECRET"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  node_env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 8000,
  database_url: process.env.DATABASE_URL!,
  redis_url: process.env.REDIS_URL!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  cors_origin: process.env.CORS_ORIGIN ?? "*",
} as const;
