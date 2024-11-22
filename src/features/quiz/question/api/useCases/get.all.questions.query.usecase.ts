import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { QuestionSortData } from "../input/question.sort.data";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { Question } from "../../domain/question.sql.entity";
import { QuestionViewType } from "../output/question.view.type";
import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { sortDirection } from "../../../../../base/sortData/sortData.model";

export class GetAllQuestionsCommand {
  constructor(public data: QuestionSortData) {}
}

@QueryHandler(GetAllQuestionsCommand)
export class GetAllQuestionsQueryUseCase
  implements
    IQueryHandler<
      GetAllQuestionsCommand,
      InterlayerNotice<Pagination<QuestionViewType>>
    >
{
  constructor(
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: GetAllQuestionsCommand,
  ): Promise<InterlayerNotice<Pagination<QuestionViewType>>> {
    const notice = new InterlayerNotice<Pagination<QuestionViewType>>();
    const sortData: QuestionSortData = {
      bodySearchTerm: command.data.bodySearchTerm ?? "",
      publishedStatus: command.data.publishedStatus,
      sortBy: command.data.sortBy ?? "createdAt",
      sortDirection: command.data.sortDirection ?? sortDirection.desc,
      pageNumber: command.data.pageNumber ? +command.data.pageNumber : 1,
      pageSize: command.data.pageSize ? +command.data.pageSize : 10,
    };

    const result =
      await this.questionsSqlQueryRepository.getAllQuestions(sortData);
    if (!result) {
      notice.addError("error DAL");
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
