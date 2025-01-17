import { Module } from "@nestjs/common";
import { TestingController } from "./api/testing.controller";
import { TestingSqlQueryRepository } from "./infrastructure/testing.query.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Question } from "../quiz/question/domain/question.sql.entity";
import { Answer } from "../quiz/game/domain/answer.sql.entity";
import { GameQuestion } from "../quiz/game/domain/game.questions.sql.entity";
import { Game } from "../quiz/game/domain/game.sql.entity";
import { Player } from "../quiz/game/domain/player.sql.entity";
import { Users } from "../users/domain/user.sql.entity";
import { Statistic } from "../quiz/game/domain/statistic.sql.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Answer,
      GameQuestion,
      Game,
      Player,
      Users,
      Statistic,
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingSqlQueryRepository],
})
export class TestingModule {}
