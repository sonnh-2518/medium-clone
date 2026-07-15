import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
}
