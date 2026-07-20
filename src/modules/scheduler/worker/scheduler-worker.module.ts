import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../../../config/database.config';
import { BlacklistedToken } from '../../auth/entities/blacklisted-token.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...databaseConfig(),
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([BlacklistedToken, RefreshToken]),
  ],
  providers: [TokenCleanupService],
})
export class SchedulerWorkerModule {}
