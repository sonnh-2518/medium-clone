import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'jake@example.com' })
  email: string;

  @ApiProperty({ example: 'jake' })
  username: string;

  @ApiProperty({ example: 'I like to write.', type: String, nullable: true })
  bio: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    type: String,
    nullable: true,
  })
  image: string | null;

  static fromEntity(user: User): UserResponseDto {
    const { id, email, username, bio, image } = user;
    return { id, email, username, bio, image };
  }
}
