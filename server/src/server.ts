import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(`[server] running in ${env.node_env} mode on port ${env.port}`);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[server] unhandledRejection:", reason);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("[server] SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});
