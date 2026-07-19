import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { refreshJwtConfig } from '../../config/jwt.config';
import { hashToken } from '../../common/utils/token-hash.util';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async create(payload: JwtPayload): Promise<string> {
    const { secret, expiresIn } = refreshJwtConfig();
    const token = this.jwtService.sign(
      { ...payload, jti: randomUUID() },
      { secret, expiresIn },
    );

    const { exp } = this.jwtService.decode<{ exp: number }>(token);
    await this.refreshTokenRepository.insert({
      tokenHash: hashToken(token),
      userId: payload.sub,
      expiresAt: new Date(exp * 1000),
    });

    return token;
  }

  async verify(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: refreshJwtConfig().secret,
      });
    } catch {
      return null;
    }
  }

  isStored(token: string): Promise<boolean> {
    return this.refreshTokenRepository.exists({
      where: { tokenHash: hashToken(token) },
    });
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ tokenHash: hashToken(token) });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }
}
