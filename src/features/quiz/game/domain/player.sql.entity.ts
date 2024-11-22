import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEnum } from "class-validator";
import { Answer } from "./answer.sql.entity";
import { Users } from "../../../users/domain/user.sql.entity";

export enum playerStatus {
  winner = "winner",
  lose = "lose",
  draft = "draft",
}
@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId: string;

  @ManyToOne(() => Users, (user) => user.player, { onDelete: "CASCADE" })
  user: Users;

  @Column({ default: 0 })
  score: number;

  @IsEnum(playerStatus)
  status: playerStatus;

  @OneToMany(() => Answer, (answer) => answer.player, {
    cascade: true,
    nullable: true,
  })
  answers: Answer[];
}
