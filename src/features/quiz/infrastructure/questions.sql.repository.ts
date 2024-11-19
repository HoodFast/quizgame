import { Question } from "../domain/question.sql.entity";
import { QuestionsCreateData } from "../api/input/questions.create.data";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionViewType } from "../api/output/question.view.type";
import { QuestionViewMapper } from "./mappers/question.view.mapper";
import { UpdateQuestionCommand } from "../api/useCases/update.question.usecase";
import { QuestionsSqlQueryRepository } from "./questions.sql.query.repository";

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
    data: UpdateQuestionCommand,
  ): Promise<QuestionViewType | null> {
    try {
      const questionUpdate = await this.questionRepository.findOne({
        where: { id: data.id },
      });
      if (!questionUpdate) return null;
      if (questionUpdate.published) return null;
      questionUpdate.body = data.body;
      questionUpdate.correctAnswers = JSON.stringify(data.correctAnswers);
      await this.questionRepository.save(questionUpdate);
      return await this.questionSqlQueryRepository.getQuestionById(data.id);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
