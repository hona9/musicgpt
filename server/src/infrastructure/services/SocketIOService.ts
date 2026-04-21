import { Server } from "socket.io";
import Redis from "ioredis";
import { ISocketIOService, WsJobEvent } from "../../domain/services/ISocketIOService";
import { env } from "../../config/env";

const CHANNEL = "socket:events";

export class SocketIOService implements ISocketIOService {
  private io: Server | null = null;
  private publisher: Redis | null = null;

  setServer(io: Server): void {
    this.io = io;
    // Subscribe to events published by worker containers and forward to clients.
    const subscriber = new Redis(env.redis_url);
    subscriber.subscribe(CHANNEL);
    subscriber.on("message", (_channel: string, msg: string) => {
      const { userId, event } = JSON.parse(msg) as { userId: string; event: WsJobEvent };
      this.io?.to(userId).emit(event.status, event);
    });
  }

  emitToUser(userId: string, event: WsJobEvent): void {
    if (this.io) {
      this.io.to(userId).emit(event.status, event);
    } else {
      // Worker process has no Socket.io server — publish to Redis for the server to forward.
      if (!this.publisher) {
        this.publisher = new Redis(env.redis_url);
      }
      void this.publisher.publish(CHANNEL, JSON.stringify({ userId, event }));
    }
  }
}

// Singleton shared between the socket.io setup code and the BullMQ worker.
export const socketIOService = new SocketIOService();
