import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player.sql.entity";
import { IsEnum } from "class-validator";

export enum AnswersStatus {
  correct = "Correct",
  incorrect = "Incorrect",
}
@Entity()
export class Answer extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  playerId: string;

  @ManyToOne(() => Player, (player) => player.answers, { onDelete: "CASCADE" })
  player: Player;

  @Column({ type: "uuid" })
  questionId: string;

  @IsEnum(AnswersStatus)
  @Column()
  answerStatus: AnswersStatus;

  @Column()
  body: string;

  @Column("date")
  addedAt: Date;
}
