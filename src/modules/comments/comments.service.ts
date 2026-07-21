import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { ArticlesService } from '../articles/articles.service';
import { PaginationMetaDto } from '../articles/dto/article-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly articlesService: ArticlesService,
  ) {}

  async create(
    slug: string,
    authorId: number,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const article = await this.articlesService.findBySlugOrFail(slug);

    const comment = this.commentsRepository.create({
      body: dto.body,
      articleId: article.id,
      authorId,
    });

    const saved = await this.commentsRepository.save(comment);
    return this.findByIdOrFail(article.id, saved.id);
  }

  async findAllByArticle(
    slug: string,
    query: QueryCommentsDto,
  ): Promise<{ comments: Comment[]; meta: PaginationMetaDto }> {
    const article = await this.articlesService.findBySlugOrFail(slug);
    const { limit = 20, offset = 0 } = query;

    const [comments, totalItems] = await this.commentsRepository.findAndCount({
      where: { articleId: article.id },
      relations: { author: true },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      comments,
      meta: {
        totalItems,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async remove(slug: string, commentId: number, userId: number): Promise<void> {
    const article = await this.articlesService.findBySlugOrFail(slug);
    const comment = await this.findByIdOrFail(article.id, commentId);
    this.assertCanDelete(comment, article.authorId, userId);
    await this.commentsRepository.remove(comment);
  }

  private async findByIdOrFail(
    articleId: number,
    commentId: number,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, articleId },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException(t('common.comments.not_found'));
    }

    return comment;
  }

  private assertCanDelete(
    comment: Comment,
    articleAuthorId: number,
    userId: number,
  ): void {
    if (comment.authorId !== userId && articleAuthorId !== userId) {
      throw new ForbiddenException(t('common.comments.not_author'));
    }
  }
}
