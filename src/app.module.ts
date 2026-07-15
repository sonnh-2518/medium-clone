import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { TagsModule } from './modules/tags/tags.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ProfilesModule,
    ArticlesModule,
    CommentsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
