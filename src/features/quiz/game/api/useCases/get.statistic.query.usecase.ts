import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";
import { StatisticViewDto } from "../output/statistics.output.dto";

export class GetMyStatisticCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMyStatisticCommand)
export class GetMyStatisticQueryUseCase
  implements
    IQueryHandler<GetMyStatisticCommand, InterlayerNotice<StatisticViewDto>>
{
  constructor(private gamesSqlQueryRepository: GameSqlQueryRepository) {}

  async execute(
    command: GetMyStatisticCommand,
  ): Promise<InterlayerNotice<StatisticViewDto>> {
    const notice = new InterlayerNotice<StatisticViewDto>();

    const result: any = await this.gamesSqlQueryRepository.getStatistic(
      command.userId,
    );
    if (!result) {
      notice.addError("error DAL");
      return notice;
    }
    notice.addData(result);
    return notice;
  }
}
