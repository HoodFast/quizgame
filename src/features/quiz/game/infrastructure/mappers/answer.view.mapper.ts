import { Answer } from "../../domain/answer.sql.entity";
import { AnswerViewType } from "../../../question/api/output/answer.view.type";

export const AnswerViewMapper = (answer: Answer): AnswerViewType => {
  return {
    questionId: answer.questionId,
    answerStatus: answer.answerStatus,
    addedAt: answer.addedAt,
  };
};
