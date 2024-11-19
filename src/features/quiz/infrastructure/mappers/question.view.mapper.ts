import { Question } from "../../domain/question.sql.entity";
import { QuestionViewType } from "../../api/output/question.view.type";

export const QuestionViewMapper = (i: Question): QuestionViewType => {
  return {
    id: i.id,
    body: i.body,
    correctAnswers: JSON.parse(i.correctAnswers),
    published: i.published,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
};
