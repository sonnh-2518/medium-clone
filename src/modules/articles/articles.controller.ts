import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ArticlesService } from './articles.service';
import {
  ArticleResponseDto,
  ArticlesListResponseDto,
} from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ArticleResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  async create(
    @CurrentUser() currentUser: JwtPayload,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.create(
      currentUser.sub,
      createArticleDto,
    );
    return ArticleResponseDto.fromEntity(article);
  }

  @Get()
  @ApiOperation({ summary: 'List articles with optional filters' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticlesListResponseDto })
  async findAll(
    @Query() query: QueryArticlesDto,
  ): Promise<ArticlesListResponseDto> {
    const { articles, meta } = await this.articlesService.findAll(query);
    return {
      articles: articles.map((article) =>
        ArticleResponseDto.fromEntity(article),
      ),
      meta,
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an article by slug' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async findOne(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    const article = await this.articlesService.findBySlugOrFail(slug);
    return ArticleResponseDto.fromEntity(article);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an article (author only)' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the author can update the article',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async update(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.articlesService.update(
      slug,
      currentUser.sub,
      updateArticleDto,
    );
    return ArticleResponseDto.fromEntity(article);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article (author only)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the author can delete the article',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async remove(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<void> {
    await this.articlesService.remove(slug, currentUser.sub);
  }
}
