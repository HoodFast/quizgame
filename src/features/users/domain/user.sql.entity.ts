import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmailConfirmation } from "./email.confirmation.entity";
import { TokensBlackList } from "./tokens.black.list.sql.entity";
import { LikePost } from "../../bloggers-platform/posts/domain/likePost.sql.entity";
import {
  Comments,
  CommentsLikes,
} from "../../bloggers-platform/comments/domain/comment.sql.entity";
import { Sessions } from "../../auth/sessions/domain/session.sql.entity";
import { Player } from "../../quiz/game/domain/player.sql.entity";
import { Statistic } from "../../quiz/game/domain/statistic.sql.entity";

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  _passwordHash: string;
  @Column({ length: 10, collation: "C" })
  login: string;
  @Column()
  email: string;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  recoveryCode: string;
  @OneToMany(
    () => EmailConfirmation,
    (EmailConfirmation) => EmailConfirmation.user,
    { cascade: true },
  )
  emailConfirmation: EmailConfirmation[];
  @OneToMany(() => Sessions, (Sessions) => Sessions.user, {
    cascade: true,
    nullable: true,
  })
  sessions: Sessions[];
  @OneToMany(() => TokensBlackList, (TokensBlackList) => TokensBlackList.user, {
    cascade: true,
    nullable: true,
  })
  tokensBlackList: TokensBlackList[];

  @OneToMany(() => LikePost, (LikePost) => LikePost.user, {
    cascade: true,
    nullable: true,
  })
  postLikes: LikePost[];

  @OneToMany(() => Comments, (Comments) => Comments.user, {
    cascade: true,
    nullable: true,
  })
  comments: Comments[];

  @OneToMany(() => CommentsLikes, (CommentsLikes) => CommentsLikes.user, {
    cascade: true,
    nullable: true,
  })
  commentLikes: Comments[];

  @OneToMany(() => Player, (player) => player.user, {
    cascade: true,
    nullable: true,
  })
  player: Player[];
  @OneToOne(() => Statistic, { cascade: true })
  statistic: Statistic;
}
