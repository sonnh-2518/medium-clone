import { randomUUID } from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { LessThan, Repository } from 'typeorm';
import { refreshJwtConfig } from '../../config/jwt.config';
import { hashToken } from '../../common/utils/token-hash.util';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const CLEANUP_JOB_NAME = 'refresh-token-cleanup';
const DEFAULT_CLEANUP_CRON = '0 0 * * *';

@Injectable()
export class RefreshTokenService implements OnModuleInit {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const cronExpression =
      process.env.REFRESH_TOKEN_CLEANUP_CRON ?? DEFAULT_CLEANUP_CRON;

    const job = new CronJob(cronExpression, () => {
      this.removeExpired().catch((error: Error) => {
        this.logger.error(
          `Failed to remove expired refresh tokens: ${error.message}`,
        );
      });
    });

    this.schedulerRegistry.addCronJob(CLEANUP_JOB_NAME, job);
    job.start();

    this.logger.log(
      `Expired refresh token cleanup scheduled with cron "${cronExpression}"`,
    );
  }

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

  private async removeExpired(): Promise<void> {
    const { affected } = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Removed ${affected ?? 0} expired refresh token(s)`);
  }
}
