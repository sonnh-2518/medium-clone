import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../entities/article.entity';

export class ArticleAuthorDto {
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

export class ArticleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'how-to-train-your-dragon' })
  slug: string;

  @ApiProperty({ example: 'How to train your dragon' })
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  description: string;

  @ApiProperty({ example: 'You have to believe' })
  body: string;

  @ApiProperty({ example: ['dragons', 'training'], type: [String] })
  tagList: string[];

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;

  static fromEntity(article: Article): ArticleResponseDto {
    const {
      id,
      slug,
      title,
      description,
      body,
      tagList,
      createdAt,
      updatedAt,
    } = article;
    return {
      id,
      slug,
      title,
      description,
      body,
      tagList: tagList ?? [],
      createdAt,
      updatedAt,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
      },
    };
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 45, description: 'Total number of matching items' })
  totalItems: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 1, description: 'Current page (1-based)' })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class ArticlesListResponseDto {
  @ApiProperty({ type: [ArticleResponseDto] })
  articles: ArticleResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
