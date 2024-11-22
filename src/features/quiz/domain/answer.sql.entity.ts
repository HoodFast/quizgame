import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player.sql.entity";

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

  @Column()
  status: boolean;

  @Column()
  body: string;

  @Column("date")
  createdAt: Date;
}
