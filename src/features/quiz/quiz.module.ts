import { Module } from "@nestjs/common";
import { QuizController } from "./api/quiz.controller";
import { GetAllQuestionsQueryUseCase } from "./api/useCases/get.all.questions.query.usecase";
import { QuestionsSqlQueryRepository } from "./infrastructure/questions.sql.query.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Question } from "./damain/question.sql.entity";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [TypeOrmModule.forFeature([Question]), CqrsModule],
  controllers: [QuizController],
  providers: [GetAllQuestionsQueryUseCase, QuestionsSqlQueryRepository],
  exports: [],
})
export class QuizModule {}
