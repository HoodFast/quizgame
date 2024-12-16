import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import { Pagination } from "../../../../../base/paginationInputDto/paginationOutput";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import {
  SortData,
  sortDirection,
} from "../../../../../base/sortData/sortData.model";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";

export class GetAllGamesCommand {
  constructor(
    public userId: string,
    public data: SortData,
  ) {}
}

@QueryHandler(GetAllGamesCommand)
export class GetAllGamesQueryUseCase
  implements
    IQueryHandler<
      GetAllGamesCommand,
      InterlayerNotice<Pagination<GameViewType>>
    >
{
  constructor(private gamesSqlQueryRepository: GameSqlQueryRepository) {}

  async execute(
    command: GetAllGamesCommand,
  ): Promise<InterlayerNotice<Pagination<GameViewType>>> {
    const notice = new InterlayerNotice<Pagination<GameViewType>>();
    const sortData: SortData = {
      sortBy: command.data.sortBy ?? "pairCreatedDate",
      sortDirection: command.data.sortDirection ?? sortDirection.desc,
      pageNumber: command.data.pageNumber ? +command.data.pageNumber : 1,
      pageSize: command.data.pageSize ? +command.data.pageSize : 10,
    };

    const result: any = await this.gamesSqlQueryRepository.getAllGamesByUserId(
      sortData,
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
