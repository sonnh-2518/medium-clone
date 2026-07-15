import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsBy({ email });
  }

  existsByUsername(username: string): Promise<boolean> {
    return this.usersRepository.existsBy({ username });
  }

  create(data: Partial<User>): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(data));
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException(t('common.errors.unauthorized'));
    }
    return user;
  }

  async updateProfile(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getProfile(userId);

    if (dto.email && dto.email !== user.email) {
      if (await this.existsByEmail(dto.email)) {
        throw new ConflictException(t('common.auth.email_taken'));
      }
      user.email = dto.email;
    }

    if (dto.username && dto.username !== user.username) {
      if (await this.existsByUsername(dto.username)) {
        throw new ConflictException(t('common.auth.username_taken'));
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
}
