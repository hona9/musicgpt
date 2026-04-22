import crypto from "crypto";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IJwtService } from "../../../domain/services/IJwtService";
import { UnauthorizedError } from "../../../shared/errors";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(token: string): Promise<RefreshTokenResult> {
    const user = await this.userRepository.findByRefreshToken(token);
    if (!user) throw new UnauthorizedError("Invalid refresh token.");

    if (new Date() > user.refreshTokenExpiresAt) {
      await this.userRepository.updateRefreshToken(user.id, null, null);
      throw new UnauthorizedError("Refresh token expired. Please log in again.");
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: user.id,
      jti: crypto.randomUUID(),
      email: user.email,
      tier: user.tier,
    });

    // No rotation — returning the same refresh token avoids the race condition
    // where a browser abort (F5) could invalidate the token before the client
    // saves the rotated value. The token is still wiped on explicit logout.
    return { accessToken, refreshToken: token };
  }
}
