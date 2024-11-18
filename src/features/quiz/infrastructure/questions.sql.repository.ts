import { Question } from "../domain/question.sql.entity";
import { QuestionsCreateData } from "../api/input/questions.create.data";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionViewType } from "../api/output/question.view.type";

export class QuestionsSqlRepository {
  constructor(
    @InjectRepository(Question)
    protected questionRepository: Repository<Question>,
  ) {}
  async createQuestion(
    data: QuestionsCreateData<string>,
  ): Promise<QuestionViewType | null> {
    try {
      const question = new Question();
      question.body = data.body;
      question.correctAnswers = data.correctAnswers;
      const created = await this.questionRepository.save(question);
      return { ...created, correctAnswers: JSON.parse(created.correctAnswers) };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
