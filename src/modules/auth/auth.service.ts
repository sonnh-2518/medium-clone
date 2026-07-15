import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (await this.usersService.findByEmail(dto.email)) {
      throw new ConflictException(this.translate('auth.email_taken'));
    }
    if (await this.usersService.findByUsername(dto.username)) {
      throw new ConflictException(this.translate('auth.username_taken'));
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
      throw new UnauthorizedException(
        this.translate('auth.invalid_credentials'),
      );
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      user: UserResponseDto.fromEntity(user),
      accessToken: this.jwtService.sign(payload),
    };
  }

  private translate(key: string): string {
    return this.i18n.t(`common.${key}`, {
      lang: I18nContext.current()?.lang,
    });
  }
}
