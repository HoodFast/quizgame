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

@Module({
  imports: [TypeOrmModule.forFeature([Question]), CqrsModule, UserModule],
  controllers: [QuizController, QuizSaController],
  providers: [
    UpdateQuestionUseCase,
    CreateQuestionUseCase,
    GetAllQuestionsQueryUseCase,
    QuestionsSqlQueryRepository,
    QuestionsSqlRepository,
  ],
  exports: [],
})
export class QuizModule {}
