import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig } from '../../config/jwt.config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Global()
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([BlacklistedToken, RefreshToken]),
    JwtModule.registerAsync({
      global: true,
      useFactory: jwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenBlacklistService, RefreshTokenService],
  exports: [TokenBlacklistService],
})
export class AuthModule {}
