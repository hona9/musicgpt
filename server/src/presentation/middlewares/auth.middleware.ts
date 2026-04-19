import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../infrastructure/services/JwtService";
import { TokenBlacklistService } from "../../infrastructure/services/TokenBlacklistService";
import { UnauthorizedError } from "../../shared/errors";

const jwtService = new JwtService();
const blacklistService = new TokenBlacklistService();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided.");
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwtService.verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired token.");
  }

  const blacklisted = await blacklistService.has(payload.jti);
  if (blacklisted) throw new UnauthorizedError("Token has been revoked.");

  req.user = payload;
  next();
}
