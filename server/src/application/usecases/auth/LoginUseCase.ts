import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IJwtService } from "../../../domain/services/IJwtService";
import { LoginDto } from "../../dtos/auth/LoginDto";
import { AuthTokensResponse } from "../../../shared/types/auth.types";
import { UnauthorizedError } from "../../../shared/errors";
import { REFRESH_TOKEN_TTL_DAYS } from "../../../config/limits";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedError("Invalid email or password.");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Invalid email or password.");

    const accessToken = this.jwtService.signAccessToken({
      sub: user.id,
      jti: crypto.randomUUID(),
      email: user.email,
      tier: user.tier,
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.userRepository.updateRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, tier: user.tier },
    };
  }
}
