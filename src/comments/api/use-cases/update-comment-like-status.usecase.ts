import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';

import { UpdateOutputData } from '../../../base/models/updateOutput';

import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql.query.repository';
import { CommentsSqlQueryRepository } from '../../infrastructure/comments.sql.query.repository';
import { CommentsOutputType } from '../model/output/comments.output';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { likesStatuses } from '../../../base/models/like.statuses';

export class UpdateCommentLikesCommand {
  constructor(
    public likesStatuses: likesStatuses,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentLikesCommand)
export class UpdateCommentLikesUseCase
  implements
    ICommandHandler<
      UpdateCommentLikesCommand,
      InterlayerNotice<UpdateOutputData>
    >
{
  constructor(
    private commentsQueryRepository: CommentsSqlQueryRepository,
    private commentsRepository: CommentsSqlRepository,

    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(
    command: UpdateCommentLikesCommand,
  ): Promise<InterlayerNotice<UpdateOutputData>> {
    const notice = new InterlayerNotice<UpdateOutputData>();

    const comment: CommentsOutputType | null =
      await this.commentsQueryRepository.getCommentById(command.commentId);
    if (!comment) {
      notice.addError('comment not found');
      return notice;
    }

    const user = await this.usersSqlQueryRepository.getUserById(command.userId);
    if (!user) {
      notice.addError('user not found');
      return notice;
    }

    const addedLike = await this.commentsRepository.addLikeToComment(
      command.userId,
      command.commentId,
      command.likesStatuses,
    );
    if (!addedLike) {
      notice.addError('added like is wrong error');
      return notice;
    }
    notice.addData({ updated: true });
    return notice;
  }
}
