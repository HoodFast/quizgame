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
import { GameQuestion } from "./game.questions.sql.entity";

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
  @Column()
  player_1Id: string;
  @OneToOne(() => Player, { cascade: true })
  player_1: Player;
  @Column()
  player_2Id: string;
  @OneToOne(() => Player, { cascade: true, nullable: true })
  player_2: Player;

  @OneToMany(() => GameQuestion, (gameQuestions) => gameQuestions.game, {
    cascade: true,
    nullable: true,
  })
  questions: GameQuestion[] | null;

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
