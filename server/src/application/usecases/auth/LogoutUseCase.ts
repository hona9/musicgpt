import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenBlacklistService } from "../../../domain/services/ITokenBlacklistService";

export class LogoutUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly blacklistService: ITokenBlacklistService,
  ) {}

  async execute(userId: string, jti: string, tokenExp: number): Promise<void> {
    const remainingTtl = Math.max(1, tokenExp - Math.floor(Date.now() / 1000));
    await Promise.all([
      this.blacklistService.add(jti, remainingTtl),
      this.userRepository.updateRefreshToken(userId, null, null),
    ]);
  }
}
