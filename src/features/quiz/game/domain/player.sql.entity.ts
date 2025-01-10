import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEnum } from "class-validator";
import { Answer } from "./answer.sql.entity";
import { Users } from "../../../users/domain/user.sql.entity";
import { Game } from "./game.sql.entity";

export enum playerStatus {
  winner = "winner",
  lose = "lose",
  draft = "draft",
}
export enum playerActive {
  pending = "pending",
  inGame = "inGame",
  finished = "finished",
}
@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // @Column({ nullable: true })
  // gameId: string;

  // @JoinColumn({ name: "gameId" })
  // @OneToOne(() => Game, { nullable: true })
  // game: Game;

  @Column("uuid")
  userId: string;

  @ManyToOne(() => Users, (user) => user.player, {
    onDelete: "CASCADE",
    nullable: true,
  })
  user: Users;

  @Column({ default: 0 })
  score: number;

  @IsEnum(playerStatus)
  @Column({ nullable: true })
  status: playerStatus;

  @IsEnum(playerActive)
  @Column({ nullable: true, default: playerActive.pending })
  active: playerActive;

  @OneToMany(() => Answer, (answer) => answer.player, {
    cascade: true,
    nullable: true,
  })
  answers: Answer[];
}
