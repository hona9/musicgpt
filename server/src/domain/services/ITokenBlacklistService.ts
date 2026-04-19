export interface ITokenBlacklistService {
  add(jti: string, ttlSeconds: number): Promise<void>;
  has(jti: string): Promise<boolean>;
}
