import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Pagination } from "../../../../base/paginationInputDto/paginationOutput";
import { QuestionSortData } from "../input/question.sort.data";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { Question } from "../../damain/question.sql.entity";

export class GetAllQuestionsCommand {
  constructor(public data: QuestionSortData) {}
}

@QueryHandler(GetAllQuestionsCommand)
export class GetAllQuestionsQueryUseCase
  implements
    IQueryHandler<
      GetAllQuestionsCommand,
      InterlayerNotice<Pagination<Question>>
    >
{
  constructor(
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: GetAllQuestionsCommand,
  ): Promise<InterlayerNotice<Pagination<Question>>> {
    const notice = new InterlayerNotice<Pagination<Question>>();
    const sortData: QuestionSortData = {
      bodySearchTerm: command.data.bodySearchTerm ?? "",
      publishedStatus: command.data.publishedStatus,
      sortBy: command.data.sortBy ?? "createdAt",
      sortDirection: command.data.sortDirection,
      pageNumber: command.data.pageNumber ? +command.data.pageNumber : 1,
      pageSize: command.data.pageSize ? +command.data.pageSize : 1,
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
