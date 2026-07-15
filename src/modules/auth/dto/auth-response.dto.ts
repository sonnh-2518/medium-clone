import { ApiProperty } from '@nestjs/swagger';

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
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
