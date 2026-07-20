import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { CommentsService } from './comments.service';
import {
  CommentResponseDto,
  CommentsListResponseDto,
} from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CommentResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async create(
    @Param('slug') slug: string,
    @CurrentUser() currentUser: JwtPayload,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      slug,
      currentUser.sub,
      createCommentDto,
    );
    return CommentResponseDto.fromEntity(comment);
  }

  @Get()
  @ApiOperation({ summary: 'List comments for an article' })
  @ApiResponse({ status: HttpStatus.OK, type: CommentsListResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async findAll(@Param('slug') slug: string): Promise<CommentsListResponseDto> {
    const comments = await this.commentsService.findAllByArticle(slug);
    return {
      comments: comments.map((comment) =>
        CommentResponseDto.fromEntity(comment),
      ),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a comment (comment author or article author only)',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the comment author or the article author can delete',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article or comment not found',
  })
  async remove(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<void> {
    await this.commentsService.remove(slug, id, currentUser.sub);
  }
}
