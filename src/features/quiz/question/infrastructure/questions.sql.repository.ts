import { Question } from "../domain/question.sql.entity";
import { QuestionsCreateData } from "../api/input/questions.create.data";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionViewType } from "../api/output/question.view.type";
import { QuestionViewMapper } from "./mappers/question.view.mapper";
import { UpdateQuestionCommand } from "../api/useCases/update.question.usecase";
import { QuestionsSqlQueryRepository } from "./questions.sql.query.repository";
import { QuestionUpdateDto } from "../api/input/question.update.dto";
import { QuestionPublishDto } from "../api/input/question.public.dto";

export class QuestionsSqlRepository {
  constructor(
    @InjectRepository(Question)
    protected questionRepository: Repository<Question>,
    protected questionSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}
  async createQuestion(
    data: QuestionsCreateData<string>,
  ): Promise<QuestionViewType | null> {
    try {
      const question = new Question();
      question.body = data.body;
      question.correctAnswers = data.correctAnswers;
      const created = await this.questionRepository.save(question);
      return QuestionViewMapper(created);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async updateQuestion(
    questionId,
    data: QuestionUpdateDto | QuestionPublishDto,
  ): Promise<boolean> {
    try {
      const question = await this.questionRepository.update(questionId, {
        ...data,
      });

      return !!question.affected;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteQuestion(questionId: string): Promise<boolean> {
    const deleted = await this.questionRepository.delete(questionId);
    return !!deleted.affected;
  }
}
