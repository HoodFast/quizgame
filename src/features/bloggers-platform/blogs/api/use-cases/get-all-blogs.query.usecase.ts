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

export class GetAllBlogsCommand {
  constructor(public sortData: BlogSortData) {}
}

@QueryHandler(GetAllBlogsCommand)
export class GetAllBlogUseCase
  implements
    IQueryHandler<
      GetAllBlogsCommand,
      InterlayerNotice<Pagination<OutputBlogMapData>>
    >
{
  constructor(private blogQueryRepository: BlogsSqlQueryRepository) {}

  async execute(
    command: GetAllBlogsCommand,
  ): Promise<InterlayerNotice<Pagination<OutputBlogMapData>>> {
    const notice = new InterlayerNotice<Pagination<OutputBlogMapData>>();
    const result = await this.blogQueryRepository.getAllBlogs(command.sortData);

    if (!result) {
      notice.addError("blogs not found", "error", 404);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
