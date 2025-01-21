import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

import {
  BlogSortData,
  SortData,
} from "../../../../../base/sortData/sortData.model";
import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { PostType } from "../../infrastructure/mappers/post.mapper";
import { PostsSqlQueryRepository } from "../../infrastructure/posts.sql.query.repository";

export class GetAllPostsCommand {
  constructor(
    public sortData: SortData,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllPostsCommand)
export class GetAllPostsUseCase
  implements
    IQueryHandler<GetAllPostsCommand, InterlayerNotice<Pagination<PostType>>>
{
  constructor(private postQueryRepository: PostsSqlQueryRepository) {}

  async execute(
    command: GetAllPostsCommand,
  ): Promise<InterlayerNotice<Pagination<PostType>>> {
    const notice = new InterlayerNotice<Pagination<PostType>>();
    const result = await this.postQueryRepository.getAllPosts(
      command.sortData,
      command.userId,
    );

    if (!result) {
      notice.addError("posts not found", "error", 404);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
