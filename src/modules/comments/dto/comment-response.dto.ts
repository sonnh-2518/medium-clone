import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../articles/dto/article-response.dto';
import { Comment } from '../entities/comment.entity';

export class CommentAuthorDto {
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

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'His name was my name too.' })
  body: string;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  static fromEntity(comment: Comment): CommentResponseDto {
    const { id, body, createdAt, updatedAt } = comment;
    return {
      id,
      body,
      createdAt,
      updatedAt,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: comment.author.image,
      },
    };
  }
}

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
