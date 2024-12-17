import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import {
  SortData,
  sortDirection,
} from "../../../../../base/sortData/sortData.model";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";

export class GetMyStatisticCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetMyStatisticCommand)
export class GetMyStatisticQueryUseCase
  implements
    IQueryHandler<
      GetMyStatisticCommand,
      InterlayerNotice<Pagination<GameViewType>>
    >
{
  constructor(private gamesSqlQueryRepository: GameSqlQueryRepository) {}

  async execute(
    command: GetMyStatisticCommand,
  ): Promise<InterlayerNotice<Pagination<GameViewType>>> {
    const notice = new InterlayerNotice<Pagination<GameViewType>>();

    const x: any = {};
    const result: any = await this.gamesSqlQueryRepository.getAllGamesByUserId(
      x,
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
