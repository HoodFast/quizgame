import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";
import { StatisticViewDto } from "../output/statistics.output.dto";
import { SortDataTopStatistic } from "../../../../../base/sortData/sortData.model";

export class GetTopCommand {
  constructor(public sortData: SortDataTopStatistic) {}
}

@QueryHandler(GetTopCommand)
export class GetTopQueryUseCase
  implements IQueryHandler<GetTopCommand, InterlayerNotice<StatisticViewDto>>
{
  constructor(private gamesSqlQueryRepository: GameSqlQueryRepository) {}

  async execute(
    command: GetTopCommand,
  ): Promise<InterlayerNotice<StatisticViewDto>> {
    const notice = new InterlayerNotice<StatisticViewDto>();

    const result: any = await this.gamesSqlQueryRepository.getTop(
      command.sortData,
    );
    if (!result) {
      notice.addError("error DAL");
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
