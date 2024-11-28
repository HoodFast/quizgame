import { AnswersStatus } from "../../../game/domain/answer.sql.entity";

export class AnswerViewType {
  questionId: string;
  answerStatus: AnswersStatus;
  addedAt: Date;
}
