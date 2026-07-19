import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenService } from './refresh-token.service';
import { TokenBlacklistService } from './token-blacklist.service';

const SALT_ROUNDS = 10;
const DEFAULT_BLACKLIST_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (await this.usersService.existsByEmail(dto.email)) {
      throw new ConflictException(t('common.auth.email_taken'));
    }
    if (await this.usersService.existsByUsername(dto.username)) {
      throw new ConflictException(t('common.auth.username_taken'));
    }

    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches =
      user !== null && (await bcrypt.compare(dto.password, user.password));

    if (!user || !passwordMatches) {
      throw new UnauthorizedException(t('common.auth.invalid_credentials'));
    }

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const payload = await this.refreshTokenService.verify(dto.refreshToken);
    if (!payload) {
      throw new UnauthorizedException(t('common.auth.invalid_refresh_token'));
    }

    if (!(await this.refreshTokenService.isStored(dto.refreshToken))) {
      // Valid signature but not in store: the token was already rotated or
      // revoked, so treat it as theft and invalidate every session.
      await this.refreshTokenService.revokeAllForUser(payload.sub);
      throw new UnauthorizedException(t('common.auth.invalid_refresh_token'));
    }

    const user = await this.usersService.getProfile(payload.sub);

    // Rotate atomically: never delete the old token without storing the new one.
    return this.dataSource.transaction(async (manager) => {
      await this.refreshTokenService.revoke(dto.refreshToken, manager);
      return this.buildAuthResponse(user, manager);
    });
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    const payload = this.jwtService.decode<JwtPayload & { exp?: number }>(
      accessToken,
    );
    const expiresAt = payload?.exp
      ? new Date(payload.exp * 1000)
      : new Date(Date.now() + DEFAULT_BLACKLIST_TTL_MS);

    // Blacklist and revoke together: a blacklisted access token must never
    // leave a still-usable refresh token behind.
    await this.dataSource.transaction(async (manager) => {
      await this.tokenBlacklistService.blacklist(
        accessToken,
        expiresAt,
        manager,
      );

      if (refreshToken) {
        await this.refreshTokenService.revoke(refreshToken, manager);
      }
    });
  }

  private async buildAuthResponse(
    user: User,
    manager?: EntityManager,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      user: UserResponseDto.fromEntity(user),
      accessToken: this.jwtService.sign(payload),
      refreshToken: await this.refreshTokenService.create(payload, manager),
    };
  }
}
