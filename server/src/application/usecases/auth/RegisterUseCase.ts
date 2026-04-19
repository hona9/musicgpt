import bcrypt from "bcryptjs";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserEntity } from "../../../domain/entities/User";
import { RegisterDto } from "../../dtos/auth/RegisterDto";
import { ConflictError } from "../../../shared/errors";

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError("Email already in use.");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.userRepository.create({ email: dto.email, passwordHash });
  }
}
