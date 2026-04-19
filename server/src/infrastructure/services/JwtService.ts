import jwt from "jsonwebtoken";
import { IJwtService } from "../../domain/services/IJwtService";
import { AccessTokenPayload } from "../../shared/types/jwt.types";
import { env } from "../../config/env";

export class JwtService implements IJwtService {
  signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
    return jwt.sign(payload, env.jwt_access_secret, { expiresIn: "15m" });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.jwt_access_secret) as AccessTokenPayload;
  }
}
