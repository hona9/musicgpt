import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../config/env";

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.database_url });
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.node_env !== "production") {
  globalForPrisma.prisma = prisma;
}
