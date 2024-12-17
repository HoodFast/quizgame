import { Module } from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { CqrsModule } from "@nestjs/cqrs";

import { UserModule } from "../users/user.module";
import { DeleteQuestionUseCase } from "./question/api/useCases/delete.question.usecase";
import { Question } from "./question/domain/question.sql.entity";
import { Answer } from "./game/domain/answer.sql.entity";
import { GameQuestion } from "./game/domain/game.questions.sql.entity";
import { Game } from "./game/domain/game.sql.entity";
import { Player } from "./game/domain/player.sql.entity";
import { PublishQuestionUseCase } from "./question/api/useCases/published.question.usecase";
import { GetAllQuestionsQueryUseCase } from "./question/api/useCases/get.all.questions.query.usecase";
import { QuestionsSqlQueryRepository } from "./question/infrastructure/questions.sql.query.repository";
import { QuizSaController } from "./question/api/quiz.sa.controller";
import { GameController } from "./game/api/game.controller";
import { UpdateQuestionUseCase } from "./question/api/useCases/update.question.usecase";
import { CreateQuestionUseCase } from "./question/api/useCases/create.question.usecase";
import { QuestionsSqlRepository } from "./question/infrastructure/questions.sql.repository";
import { AuthModule } from "../auth/auth.module";
import { GameSqlRepository } from "./game/infrastructure/game.sql.repository";
import { GameSqlQueryRepository } from "./game/infrastructure/game.sql.query.repository";
import { PlayerSqlRepository } from "./game/infrastructure/player.sql.repository";
import { PlayerSqlQueryRepository } from "./game/infrastructure/player.sql.query.repository";
import { ConnectGameUseCase } from "./game/api/useCases/connect.game.usecase";
import { GetGameUseCase } from "./game/api/useCases/get.game.usecase";
import { GetCurrentGameUseCase } from "./game/api/useCases/get.current.game.usecase";
import { AnswerGameUseCase } from "./game/api/useCases/answer.game.usecase";
import { GetAllGamesQueryUseCase } from "./game/api/useCases/get.all.games.query.usecase";
import { GetMyStatisticQueryUseCase } from "./game/api/useCases/get.statistic.query.usecase";

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Answer, GameQuestion, Game, Player]),
    CqrsModule,
    // UserModule,
    AuthModule,
  ],
  controllers: [QuizSaController, GameController],
  providers: [
    GetMyStatisticQueryUseCase,
    GetAllGamesQueryUseCase,
    AnswerGameUseCase,
    GetCurrentGameUseCase,
    GetGameUseCase,
    ConnectGameUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
    PublishQuestionUseCase,
    CreateQuestionUseCase,
    GetAllQuestionsQueryUseCase,
    QuestionsSqlQueryRepository,
    QuestionsSqlRepository,
    GameSqlRepository,
    GameSqlQueryRepository,
    PlayerSqlRepository,
    PlayerSqlQueryRepository,
  ],
  exports: [],
})
export class QuizModule {}
