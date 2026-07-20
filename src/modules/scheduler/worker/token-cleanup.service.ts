import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { LessThan, Repository } from 'typeorm';
import { BlacklistedToken } from '../../auth/entities/blacklisted-token.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

const DEFAULT_CLEANUP_CRON = '0 0 * * *';

@Injectable()
export class TokenCleanupService implements OnModuleInit {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    this.registerJob(
      'token-blacklist-cleanup',
      process.env.TOKEN_BLACKLIST_CLEANUP_CRON ?? DEFAULT_CLEANUP_CRON,
      () => this.removeExpiredBlacklistedTokens(),
    );
    this.registerJob(
      'refresh-token-cleanup',
      process.env.REFRESH_TOKEN_CLEANUP_CRON ?? DEFAULT_CLEANUP_CRON,
      () => this.removeExpiredRefreshTokens(),
    );
  }

  private registerJob(
    name: string,
    cronExpression: string,
    task: () => Promise<void>,
  ): void {
    const job = new CronJob(cronExpression, () => {
      task().catch((error: Error) => {
        this.logger.error(`Job "${name}" failed: ${error.message}`);
      });
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.log(`Job "${name}" scheduled with cron "${cronExpression}"`);
  }

  private async removeExpiredBlacklistedTokens(): Promise<void> {
    const { affected } = await this.blacklistedTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Removed ${affected ?? 0} expired blacklisted token(s)`);
  }

  private async removeExpiredRefreshTokens(): Promise<void> {
    const { affected } = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Removed ${affected ?? 0} expired refresh token(s)`);
  }
}
