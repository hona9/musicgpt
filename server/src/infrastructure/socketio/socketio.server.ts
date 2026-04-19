import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { JwtService } from "../services/JwtService";
import { TokenBlacklistService } from "../services/TokenBlacklistService";
import { socketIOService } from "../services/SocketIOService";
import { env } from "../../config/env";

const jwtService = new JwtService();
const blacklistService = new TokenBlacklistService();

export function attachSocketIO(httpServer: HttpServer): void {
  const io = new Server(httpServer, {
    cors: { origin: env.cors_origin, methods: ["GET", "POST"] },
  });

  socketIOService.setServer(io);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      return next(new Error("No token provided."));
    }

    let payload;
    try {
      payload = jwtService.verifyAccessToken(token);
    } catch {
      return next(new Error("Invalid or expired token."));
    }

    const blacklisted = await blacklistService.has(payload.jti);
    if (blacklisted) {
      return next(new Error("Token has been revoked."));
    }

    socket.data.userId = payload.sub;
    next();
  });

  io.on("connection", (socket) => {
    socket.join(socket.data.userId);
  });
}
