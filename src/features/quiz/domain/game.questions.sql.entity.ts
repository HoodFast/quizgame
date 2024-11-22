import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player.sql.entity";
import { Game } from "./game.sql.entity";
import { Question } from "./question.sql.entity";

@Entity()
export class GameQuestions extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  gameId: string;

  @ManyToOne(() => Game, (game) => game.questions, { onDelete: "CASCADE" })
  game: Game;

  @Column("uuid")
  questionId: string;

  @ManyToOne(() => Question)
  question: Question;
}
