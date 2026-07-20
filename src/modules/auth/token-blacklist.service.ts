import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { hashToken } from '../../common/utils/token-hash.util';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {}

  async blacklist(
    token: string,
    expiresAt: Date,
    manager?: EntityManager,
  ): Promise<void> {
    const repository =
      manager?.getRepository(BlacklistedToken) ??
      this.blacklistedTokenRepository;

    await repository
      .createQueryBuilder()
      .insert()
      .values({ tokenHash: hashToken(token), expiresAt })
      .orIgnore()
      .execute();
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.blacklistedTokenRepository.exists({
      where: { tokenHash: hashToken(token) },
    });
  }
}
