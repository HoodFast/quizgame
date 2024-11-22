import { Module } from "@nestjs/common";
import { QuizController } from "./api/quiz.controller";
import { GetAllQuestionsQueryUseCase } from "./api/useCases/get.all.questions.query.usecase";
import { QuestionsSqlQueryRepository } from "./infrastructure/questions.sql.query.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Question } from "./domain/question.sql.entity";
import { CqrsModule } from "@nestjs/cqrs";
import { QuestionsSqlRepository } from "./infrastructure/questions.sql.repository";
import { CreateQuestionUseCase } from "./api/useCases/create.question.usecase";
import { QuizSaController } from "./api/quiz.sa.controller";
import { UserModule } from "../users/user.module";
import { UpdateQuestionUseCase } from "./api/useCases/update.question.usecase";
import { PublishQuestionUseCase } from "./api/useCases/published.question.usecase";
import { DeleteQuestionUseCase } from "./api/useCases/delete.question.usecase";
import { Answer } from "./domain/answer.sql.entity";
import { GameQuestions } from "./domain/game.questions.sql.entity";
import { Game } from "./domain/game.sql.entity";
import { Player } from "./domain/player.sql.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Answer, GameQuestions, Game, Player]),
    CqrsModule,
    UserModule,
  ],
  controllers: [QuizController, QuizSaController],
  providers: [
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
    PublishQuestionUseCase,
    CreateQuestionUseCase,
    GetAllQuestionsQueryUseCase,
    QuestionsSqlQueryRepository,
    QuestionsSqlRepository,
  ],
  exports: [],
})
export class QuizModule {}
