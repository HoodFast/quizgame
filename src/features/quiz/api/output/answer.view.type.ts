import { AnswersStatus } from "../../domain/answer.sql.entity";

export class AnswerViewType {
  questionId: string;
  answerStatus: AnswersStatus;
  addedAt: boolean;
}
