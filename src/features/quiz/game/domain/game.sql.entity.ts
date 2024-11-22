import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEnum } from "class-validator";
import { Player } from "./player.sql.entity";
import { GameQuestions } from "./game.questions.sql.entity";

export enum gameStatuses {
  pending = "PendingSecondPlayer",
  active = "Active",
  finished = "Finished",
}
@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsEnum(gameStatuses)
  @Column({ default: gameStatuses.pending })
  status: gameStatuses;

  @OneToOne(() => Player, { cascade: true })
  player_1: Player;

  @OneToOne(() => Player, { cascade: true, nullable: true })
  player_2: Player;

  @OneToMany(() => GameQuestions, (gameQuestions) => gameQuestions.game, {
    cascade: true,
    nullable: true,
  })
  questions: GameQuestions[];

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  pairCreatedDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  startGameDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  finishGameDate: Date;
}
