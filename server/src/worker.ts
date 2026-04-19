import { startPromptWorker, startScheduler } from "./infrastructure/queue/prompt.worker";

// Standalone worker process entry point.
// NOTE: In this mode, socket.io is NOT available (no HTTP server).
// The worker will update DB statuses correctly but socket.io events won't be emitted.
// For real-time events in standalone mode, you'd need the @socket.io/redis-adapter package.
//
// For development (single process), the worker is started inside server.ts instead.

console.log("[worker] starting prompt worker and scheduler");

startPromptWorker();
startScheduler();

process.on("SIGTERM", () => {
  console.log("[worker] SIGTERM received, shutting down gracefully");
  process.exit(0);
});
