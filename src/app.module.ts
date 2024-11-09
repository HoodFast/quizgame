import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsController } from './posts/api/posts.controller';
import { PostService } from './posts/application/posts.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogService } from './blogs/application/blogs.service';
import { UsersService } from './features/users/application/users.service';
import { TestingSqlQueryRepository } from './testing/infrastructure/testing.query.repository';
import { TestingController } from './testing/api/testing.controller';
import { AuthService } from './features/auth/application/auth.service';
import { JwtService } from './features/auth/infrastructure/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './features/auth/infrastructure/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, {
  ConfigServiceType,
  validate,
} from './settings/configuration';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogExistsValidator } from './base/validate/blog.exist.validate';
import { SecurityController } from './sessions/api/security.controller';
import { UsersSqlRepository } from './features/users/infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './features/users/infrastructure/users.sql.query.repository';
import { SessionSqlQueryRepository } from './sessions/infrastructure/session.sql.query.repository';
import { SessionSqlRepository } from './sessions/infrastructure/session.sql.repository';
import { Users } from './features/users/domain/user.sql.entity';
import { EmailConfirmation } from './features/users/domain/email.confirmation.entity';
import { Sessions } from './sessions/domain/session.sql.entity';
import { TokensBlackList } from './features/users/domain/tokens.black.list.sql.entity';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs.sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/blogs.sql.query.repository';
import { LikePost } from './posts/domain/likePost.sql.entity';
import { Blogs } from './blogs/domain/blog.sql.entity';
import { Posts } from './posts/domain/post.sql.entity';
import { PostsSqlQueryRepository } from './posts/infrastructure/posts.sql.query.repository';
import { PostsSqlRepository } from './posts/infrastructure/posts.sql.repository';
import { BlogsSaController } from './blogs/api/blogs.sa.controller';
import { PostsSaController } from './posts/api/posts.sa.controller';
import { UpdateSaPostUseCase } from './posts/api/use-cases/update-sa-post.usecase';
import { DeleteSaPostUseCase } from './posts/api/use-cases/delete-sa-post.usecase';
import { Comments, CommentsLikes } from './comments/domain/comment.sql.entity';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments.sql.query.repository';
import { UserModule } from './features/users/user.module';
import { AuthModule } from './features/auth/auth.module';
import { BloggersPlatform } from './features/bloggers-platform/bloggers.platform.module';
import { DeleteSessionByIdUseCase } from './sessions/api/useCases/delete-session-by-id.usecase';
import { GetAllSessionUseCase } from './sessions/api/useCases/get-all-sessions.usecase';
import { DeleteAllSessionsUseCase } from './sessions/api/useCases/delete-all-sessions.usecase';

const useCases = [
  GetAllSessionUseCase,
  DeleteSessionByIdUseCase,
  DeleteAllSessionsUseCase,
];

// const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/nest';
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigServiceType) => {
        const sqlDataBaseSettings = configService.get('sqlDataBaseSettings', {
          infer: true,
        });
        return {
          type: 'postgres',
          host: sqlDataBaseSettings?.SQL_HOST,
          username: sqlDataBaseSettings?.SQL_USERNAME,
          password: sqlDataBaseSettings?.SQL_PASS,
          database: 'neondb',
          ssl: true,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([Users]),
    TypeOrmModule.forFeature([TokensBlackList]),
    TypeOrmModule.forFeature([Blogs]),
    TypeOrmModule.forFeature([LikePost]),
    TypeOrmModule.forFeature([Posts]),
    TypeOrmModule.forFeature([Comments]),
    TypeOrmModule.forFeature([CommentsLikes]),
    TypeOrmModule.forFeature([EmailConfirmation]),
    TypeOrmModule.forFeature([Sessions]),
    AuthModule,
    UserModule,
    BloggersPlatform,
  ],
  controllers: [AppController, TestingController, SecurityController],
  providers: [
    CommentsSqlQueryRepository,
    CommentsSqlRepository,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsSqlQueryRepository,
    PostsSqlRepository,
    AppService,
    PostService,
    BlogService,
    TestingSqlQueryRepository,
    AuthService,
    AuthService,
    ConfigService,
    BlogExistsValidator,
    SessionSqlQueryRepository,
    SessionSqlRepository,
    JwtService,
    EmailService,
    UsersService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    ...useCases,
  ],
})
export class AppModule {}
