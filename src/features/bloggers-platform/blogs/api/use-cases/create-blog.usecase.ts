import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

import { BlogsSqlRepository } from "../../infrastructure/blogs.sql.repository";
import { BlogsSqlQueryRepository } from "../../infrastructure/blogs.sql.query.repository";
import { OutputBlogMapData } from "../model/output/outputBlog.model";

export class CommandCreateBlogData {
  blogId: string;
}

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt = new Date().toISOString(),
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements
    ICommandHandler<CreateBlogCommand, InterlayerNotice<OutputBlogMapData>>
{
  constructor(
    private blogsRepository: BlogsSqlRepository,
    private blogsQueryRepository: BlogsSqlQueryRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<InterlayerNotice<OutputBlogMapData>> {
    const notice = new InterlayerNotice<OutputBlogMapData>();
    const result = await this.blogsRepository.createBlog(command);

    if (!result) {
      notice.addError("blog don`t create");
      return notice;
    }
    const blog = await this.blogsQueryRepository.getBlogById(result.id);
    if (!blog) {
      notice.addError("blog don`t create");
      return notice;
    }
    notice.addData(blog);
    return notice;
  }
}
