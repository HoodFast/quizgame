import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

import { BlogsSqlRepository } from "../../infrastructure/blogs.sql.repository";
import {
  BlogSortData,
  SortData,
} from "../../../../../base/sortData/sortData.model";
import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { OutputBlogMapData } from "../model/output/outputBlog.model";
import { BlogsSqlQueryRepository } from "../../infrastructure/blogs.sql.query.repository";

export class GetBlogByIdCommand {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase
  implements
    IQueryHandler<GetBlogByIdCommand, InterlayerNotice<OutputBlogMapData>>
{
  constructor(private blogQueryRepository: BlogsSqlQueryRepository) {}

  async execute(
    command: GetBlogByIdCommand,
  ): Promise<InterlayerNotice<OutputBlogMapData>> {
    const notice = new InterlayerNotice<OutputBlogMapData>();
    const result = await this.blogQueryRepository.getBlogById(command.blogId);

    if (!result) {
      notice.addError("blogs not found", "error", 404);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
