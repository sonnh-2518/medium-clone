import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { LessThan, Repository } from 'typeorm';
import { hashToken } from '../../common/utils/token-hash.util';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

const CLEANUP_JOB_NAME = 'token-blacklist-cleanup';
const DEFAULT_CLEANUP_CRON = '0 0 * * *';

@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const cronExpression =
      process.env.TOKEN_BLACKLIST_CLEANUP_CRON ?? DEFAULT_CLEANUP_CRON;

    const job = new CronJob(cronExpression, () => {
      this.removeExpired().catch((error: Error) => {
        this.logger.error(
          `Failed to remove expired blacklisted tokens: ${error.message}`,
        );
      });
    });

    this.schedulerRegistry.addCronJob(CLEANUP_JOB_NAME, job);
    job.start();

    this.logger.log(
      `Expired token cleanup scheduled with cron "${cronExpression}"`,
    );
  }

  async blacklist(token: string, expiresAt: Date): Promise<void> {
    await this.blacklistedTokenRepository
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

  private async removeExpired(): Promise<void> {
    const { affected } = await this.blacklistedTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Removed ${affected ?? 0} expired blacklisted token(s)`);
  }
}
