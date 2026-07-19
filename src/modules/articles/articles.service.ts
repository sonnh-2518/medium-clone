import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async create(authorId: number, dto: CreateArticleDto): Promise<Article> {
    const article = this.articlesRepository.create({
      title: dto.title,
      description: dto.description,
      body: dto.body,
      tagList: dto.tagList ?? [],
      slug: await this.generateUniqueSlug(dto.title),
      authorId,
    });

    const saved = await this.articlesRepository.save(article);
    return this.findBySlugOrFail(saved.slug);
  }

  async findAll(
    query: QueryArticlesDto,
  ): Promise<{ articles: Article[]; articlesCount: number }> {
    const { tag, author, limit = 20, offset = 0 } = query;

    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (tag) {
      qb.andWhere(`:tag = ANY(string_to_array(article."tagList", ','))`, {
        tag,
      });
    }

    if (author) {
      qb.andWhere('author.username = :author', { author });
    }

    const [articles, articlesCount] = await qb.getManyAndCount();
    return { articles, articlesCount };
  }

  async findBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      relations: { author: true },
    });

    if (!article) {
      throw new NotFoundException(t('common.articles.not_found'));
    }

    return article;
  }

  async update(
    slug: string,
    userId: number,
    dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findBySlugOrFail(slug);
    this.assertIsAuthor(article, userId);

    if (dto.title && dto.title !== article.title) {
      article.title = dto.title;
      article.slug = await this.generateUniqueSlug(dto.title);
    }

    if (dto.description !== undefined) {
      article.description = dto.description;
    }

    if (dto.body !== undefined) {
      article.body = dto.body;
    }

    if (dto.tagList !== undefined) {
      article.tagList = dto.tagList;
    }

    return this.articlesRepository.save(article);
  }

  async remove(slug: string, userId: number): Promise<void> {
    const article = await this.findBySlugOrFail(slug);
    this.assertIsAuthor(article, userId);
    await this.articlesRepository.remove(article);
  }

  private assertIsAuthor(article: Article, userId: number): void {
    if (article.authorId !== userId) {
      throw new ForbiddenException(t('common.articles.not_author'));
    }
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = this.slugify(title) || 'article';

    if (!(await this.articlesRepository.existsBy({ slug: base }))) {
      return base;
    }

    return `${base}-${Date.now().toString(36)}`;
  }
}
