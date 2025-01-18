import { Module } from "@nestjs/common";
import { PostsController } from "./posts/api/posts.controller";
import { BlogsController } from "./blogs/api/blogs.controller";
import { CommentsController } from "./comments/api/comments.controller";
import { BlogsSaController } from "./blogs/api/blogs.sa.controller";
import { PostsSaController } from "./posts/api/posts.sa.controller";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Posts } from "./posts/domain/post.sql.entity";
import { Blogs } from "./blogs/domain/blog.sql.entity";
import { Comments, CommentsLikes } from "./comments/domain/comment.sql.entity";
import { CreateBlogUseCase } from "./blogs/api/use-cases/create-blog.usecase";
import { CreatePostForBlogUseCase } from "./posts/api/use-cases/create-post-for-blog.usecase";
import { UpdateBlogUseCase } from "./blogs/api/use-cases/update-blog.usecase";
import { DeleteBlogUseCase } from "./blogs/api/use-cases/delete-blog.usecase";
import { UpdatePostUseCase } from "./posts/api/use-cases/update-post.usecase";
import { UpdateLikesUseCase } from "./posts/api/use-cases/update-likes.usecase";
import { GetCommentUseCase } from "./comments/api/use-cases/get-comment-by-id.usecase";
import { CreateCommentForPostUseCase } from "./posts/api/use-cases/create-comment-for-post.usecase";
import { UpdateCommentLikesUseCase } from "./comments/api/use-cases/update-comment-like-status.usecase";
import { UpdateCommentBodyUseCase } from "./comments/api/use-cases/update-comment-body.usecase";
import { DeleteCommentUseCase } from "./comments/api/use-cases/delete-comment.usecase";
import { UpdateSaPostUseCase } from "./posts/api/use-cases/update-sa-post.usecase";
import { DeleteSaPostUseCase } from "./posts/api/use-cases/delete-sa-post.usecase";
import { PostService } from "./posts/application/posts.service";
import { BlogService } from "./blogs/application/blogs.service";
import { BlogsSqlRepository } from "./blogs/infrastructure/blogs.sql.repository";
import { BlogsSqlQueryRepository } from "./blogs/infrastructure/blogs.sql.query.repository";
import { PostsSqlRepository } from "./posts/infrastructure/posts.sql.repository";
import { PostsSqlQueryRepository } from "./posts/infrastructure/posts.sql.query.repository";
import { CommentsSqlRepository } from "./comments/infrastructure/comments.sql.repository";
import { CommentsSqlQueryRepository } from "./comments/infrastructure/comments.sql.query.repository";
import { LikePost } from "./posts/domain/likePost.sql.entity";
import { Users } from "../users/domain/user.sql.entity";
import { TokensBlackList } from "../users/domain/tokens.black.list.sql.entity";
import { EmailConfirmation } from "../users/domain/email.confirmation.entity";
import { UserModule } from "../users/user.module";
import { CqrsModule } from "@nestjs/cqrs";
import { BlogExistsValidator } from "../../base/validate/blog.exist.validate";
import { Sessions } from "../auth/sessions/domain/session.sql.entity";
import { AuthModule } from "../auth/auth.module";
import { GetAllBlogUseCase } from "./blogs/api/use-cases/get-all-blogs.query.usecase";
import { GetAllPostsForBlogUseCase } from "./blogs/api/use-cases/get-all-posts-for-blog.query.usecase";

const useCases = [
  GetAllPostsForBlogUseCase,
  GetAllBlogUseCase,
  CreateBlogUseCase,
  CreatePostForBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  UpdatePostUseCase,
  UpdateLikesUseCase,
  GetCommentUseCase,
  CreateCommentForPostUseCase,
  UpdateCommentLikesUseCase,
  UpdateCommentBodyUseCase,
  DeleteCommentUseCase,
  UpdateSaPostUseCase,
  DeleteSaPostUseCase,
];
const services = [PostService, BlogService];
const repositories = [
  BlogsSqlRepository,
  BlogsSqlQueryRepository,
  PostsSqlRepository,
  PostsSqlQueryRepository,
  CommentsSqlRepository,
  CommentsSqlQueryRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sessions,
      Posts,
      Blogs,
      Comments,
      LikePost,
      CommentsLikes,
      Users,
      TokensBlackList,
      EmailConfirmation,
    ]),
    UserModule,
    AuthModule,
    CqrsModule,
  ],
  controllers: [
    PostsController,
    BlogsController,
    CommentsController,
    BlogsSaController,
    PostsSaController,
  ],
  providers: [BlogExistsValidator, ...useCases, ...services, ...repositories],
})
export class BloggersPlatformModule {}
