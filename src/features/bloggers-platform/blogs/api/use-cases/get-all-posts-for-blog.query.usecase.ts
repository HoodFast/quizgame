import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import {
  ERRORS_CODE,
  InterlayerNotice,
} from "../../../../../base/models/Interlayer";

import { BlogsSqlRepository } from "../../infrastructure/blogs.sql.repository";
import {
  BlogSortData,
  SortData,
} from "../../../../../base/sortData/sortData.model";
import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { OutputBlogMapData } from "../model/output/outputBlog.model";
import { BlogsSqlQueryRepository } from "../../infrastructure/blogs.sql.query.repository";
import { PostsSqlQueryRepository } from "../../../posts/infrastructure/posts.sql.query.repository";
import { PostType } from "../../../posts/infrastructure/mappers/post.mapper";

export class GetAllPostsForBlogCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public sortData: SortData,
  ) {}
}

@QueryHandler(GetAllPostsForBlogCommand)
export class GetAllPostsForBlogUseCase
  implements
    IQueryHandler<
      GetAllPostsForBlogCommand,
      InterlayerNotice<Pagination<PostType>>
    >
{
  constructor(private postsQueryRepository: PostsSqlQueryRepository) {}

  async execute(
    command: GetAllPostsForBlogCommand,
  ): Promise<InterlayerNotice<Pagination<PostType>>> {
    const notice = new InterlayerNotice<Pagination<PostType>>();
    const result = await this.postsQueryRepository.getAllPostsForBlog(
      command.userId,
      command.blogId,
      command.sortData,
    );

    if (!result) {
      notice.addError("not found", "error", ERRORS_CODE.NOT_FOUND);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
