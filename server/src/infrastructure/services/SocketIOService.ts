import { Server } from "socket.io";
import { ISocketIOService, WsJobEvent } from "../../domain/services/ISocketIOService";

export class SocketIOService implements ISocketIOService {
  private io: Server | null = null;

  setServer(io: Server): void {
    this.io = io;
  }

  emitToUser(userId: string, event: WsJobEvent): void {
    this.io?.to(userId).emit(event.status, event);
  }
}

// Singleton shared between the socket.io setup code and the BullMQ worker.
export const socketIOService = new SocketIOService();
