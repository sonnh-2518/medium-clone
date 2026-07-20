import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { ArticlesService } from '../articles/articles.service';
import { CreateCommentDto } from './dto/create-comment.dto';
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

  async findAllByArticle(slug: string): Promise<Comment[]> {
    const article = await this.articlesService.findBySlugOrFail(slug);

    return this.commentsRepository.find({
      where: { articleId: article.id },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
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
