import { CommentsOutputType } from '../../api/model/output/comments.output';
import { likesStatuses } from '../../../../../base/models/like.statuses';

export const commentMapper = (
  userId: string | null,
  comment,
): CommentsOutputType => {
  let myStatus = likesStatuses.none;
  if (userId) {
    myStatus = comment.getMyStatus(userId);
  }

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: myStatus,
    },
  };
};
