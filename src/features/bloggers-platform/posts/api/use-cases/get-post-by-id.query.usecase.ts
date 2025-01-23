import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

import { PostType } from "../../infrastructure/mappers/post.mapper";
import { PostsSqlQueryRepository } from "../../infrastructure/posts.sql.query.repository";

export class GetPostByIdCommand {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdCommand)
export class GetPostByIdUseCase
  implements IQueryHandler<GetPostByIdCommand, InterlayerNotice<PostType>>
{
  constructor(private postsQueryRepository: PostsSqlQueryRepository) {}

  async execute(
    command: GetPostByIdCommand,
  ): Promise<InterlayerNotice<PostType>> {
    const notice = new InterlayerNotice<PostType>();
    const result = await this.postsQueryRepository.getPostById(
      command.postId,
      command.userId,
    );

    if (!result) {
      notice.addError("post not found", "error", 404);
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
