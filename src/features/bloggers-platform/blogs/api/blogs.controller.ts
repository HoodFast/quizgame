import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { PostInput } from "../../posts/api/input/PostsCreate.dto";

import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  CommandCreateBlogData,
  CreateBlogCommand,
} from "./use-cases/create-blog.usecase";
import { InterlayerNotice } from "../../../../base/models/Interlayer";
import {
  CommandCreatePostForBlogOutput,
  CreatePostForBlogCommand,
} from "../../posts/api/use-cases/create-post-for-blog.usecase";
import { AuthGuard } from "../../../../guards/auth.guard";
import { createBlogInputDto } from "./model/input/create-blog-input-dto";
import {
  CommandUpdateBlogData,
  UpdateBlogCommand,
} from "./use-cases/update-blog.usecase";

import {
  CommandDeleteBlogOutputData,
  DeleteBlogCommand,
} from "./use-cases/delete-blog.usecase";
import { AccessTokenGetId } from "../../../../guards/access.token.get.id";
import { BlogsSqlQueryRepository } from "../infrastructure/blogs.sql.query.repository";
import { PostsSqlQueryRepository } from "../../posts/infrastructure/posts.sql.query.repository";
import { SortDirectionPipe } from "../../../../base/pipes/sortDirectionPipe";
import { UserId } from "../../../../decorators/userId";
import { GetAllBlogsCommand } from "./use-cases/get-all-blogs.query.usecase";
import {
  BlogSortData,
  SortData,
} from "../../../../base/sortData/sortData.model";
import { Pagination } from "../../../../base/paginationInputDto/paginationOutput";
import { OutputBlogMapData } from "./model/output/outputBlog.model";
import { GetAllPostsForBlogCommand } from "./use-cases/get-all-posts-for-blog.query.usecase";
import { PostType } from "../../posts/infrastructure/mappers/post.mapper";

export enum sortDirection {
  asc = "ASC",
  desc = "DESC",
}

export type queryBlogsInputType = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: sortDirection;
  pageNumber?: number;
  pageSize?: number;
};

@Controller("blogs")
export class BlogsController {
  constructor(
    protected blogsQueryRepository: BlogsSqlQueryRepository,
    protected postsQueryRepository: PostsSqlQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @UsePipes(SortDirectionPipe)
  @Get()
  async getAllBlogs(@Query() query: queryBlogsInputType) {
    const sortData: BlogSortData = {
      searchNameTerm: query.searchNameTerm ?? "",
      sortBy: query.sortBy ?? "createdAt",
      sortDirection: query.sortDirection ?? sortDirection.desc,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };

    const command = new GetAllBlogsCommand(sortData);
    const res = await this.queryBus.execute<
      GetAllBlogsCommand,
      InterlayerNotice<Pagination<OutputBlogMapData>>
    >(command);
    // const blogs = await this.blogsQueryRepository.getAllBlogs(sortData);
    return res.execute();
  }

  @Get(":id")
  async getBlogById(@Param("id") blogId: string) {
    const blog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
  }

  @UseGuards(AccessTokenGetId)
  @Get(":id/posts")
  async getPostsForBlog(
    @Param("id") blogId: string,
    @Query() query: queryBlogsInputType,
    @UserId() userId: string,
  ) {
    const sortData: SortData = {
      sortBy: query.sortBy ?? "createdAt",
      sortDirection: query.sortDirection ?? sortDirection.desc,
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
    };
    const command = new GetAllPostsForBlogCommand(userId, blogId, sortData);
    const res = await this.queryBus.execute<
      GetAllPostsForBlogCommand,
      InterlayerNotice<Pagination<PostType>>
    >(command);
    const posts = await this.postsQueryRepository.getAllPostsForBlog(
      userId,
      blogId,
      sortData,
    );
    return res.execute();
  }

  @UseGuards(AuthGuard)
  @Post()
  async createBlog(@Body() inputModel: createBlogInputDto) {
    const command = new CreateBlogCommand(
      inputModel.name,
      inputModel.description,
      inputModel.websiteUrl,
    );
    const creatingBlog = await this.commandBus.execute<
      CreateBlogCommand,
      InterlayerNotice<CommandCreateBlogData>
    >(command);
    const blog = await this.blogsQueryRepository.getBlogById(
      creatingBlog.data!.blogId,
    );
    return blog;
  }

  @UseGuards(AuthGuard)
  @Post(":id/posts")
  async createPostForBlog(
    @Param("id") blogId: string,
    @Body() input: PostInput,
  ) {
    const command = new CreatePostForBlogCommand(
      input.title,
      input.content,
      input.shortDescription,
      blogId,
    );

    const creatingPost = await this.commandBus.execute<
      CreatePostForBlogCommand,
      InterlayerNotice<CommandCreatePostForBlogOutput>
    >(command);

    if (creatingPost.hasError())
      throw new NotFoundException(creatingPost.extensions[0].message);
    const post = await this.postsQueryRepository.getPostById(
      creatingPost.data!.postId,
    );
    return post;
  }

  @HttpCode(204)
  @UseGuards(AuthGuard)
  @Put(":id")
  async updateBlog(
    @Param("id") blogId: string,
    @Body() body: createBlogInputDto,
  ) {
    const command = new UpdateBlogCommand(
      body.name,
      body.description,
      body.websiteUrl,
      blogId,
    );

    const updatedBlog = await this.commandBus.execute<
      UpdateBlogCommand,
      InterlayerNotice<CommandUpdateBlogData>
    >(command);
    if (updatedBlog.hasError()) throw new NotFoundException();
    return;
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  @HttpCode(204)
  async deleteBlogById(@Param("id") blogId: string) {
    const command = new DeleteBlogCommand(blogId);
    const deletedBlog = await this.commandBus.execute<
      DeleteBlogCommand,
      InterlayerNotice<CommandDeleteBlogOutputData>
    >(command);
    if (deletedBlog.hasError()) throw new NotFoundException();
    return;
  }
}
