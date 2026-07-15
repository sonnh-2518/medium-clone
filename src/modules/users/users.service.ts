import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  create(data: Partial<User>): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(data));
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException(this.translate('errors.unauthorized'));
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getProfile(userId);

    if (dto.email && dto.email !== user.email) {
      if (await this.findByEmail(dto.email)) {
        throw new ConflictException(this.translate('auth.email_taken'));
      }
      user.email = dto.email;
    }

    if (dto.username && dto.username !== user.username) {
      if (await this.findByUsername(dto.username)) {
        throw new ConflictException(this.translate('auth.username_taken'));
      }
      user.username = dto.username;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }

    if (dto.image !== undefined) {
      user.image = dto.image;
    }

    return this.usersRepository.save(user);
  }

  private translate(key: string): string {
    return this.i18n.t(`common.${key}`, {
      lang: I18nContext.current()?.lang,
    });
  }
}
