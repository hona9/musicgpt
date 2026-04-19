import crypto from "crypto";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IJwtService } from "../../../domain/services/IJwtService";
import { UnauthorizedError } from "../../../shared/errors";
import { REFRESH_TOKEN_TTL_DAYS } from "../../../config/limits";

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

    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.userRepository.updateRefreshToken(user.id, newRefreshToken, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
