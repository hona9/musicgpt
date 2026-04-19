import { AccessTokenPayload } from "../../shared/types/jwt.types";

export interface IJwtService {
  signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string;
  verifyAccessToken(token: string): AccessTokenPayload;
}
