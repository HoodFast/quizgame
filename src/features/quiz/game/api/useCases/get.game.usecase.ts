import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
  ERRORS_CODE,
  InterlayerNotice,
} from "../../../../../base/models/Interlayer";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { gameStatuses } from "../../domain/game.sql.entity";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";

export class GetGameCommand {
  constructor(
    public gameId: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetGameCommand)
export class GetGameUseCase
  implements IQueryHandler<GetGameCommand, InterlayerNotice<GameViewType>>
{
  constructor(private gameSqlQueryRepository: GameSqlQueryRepository) {}

  async execute(
    command: GetGameCommand,
  ): Promise<InterlayerNotice<GameViewType>> {
    const notice = new InterlayerNotice<GameViewType>();
    //-----------------------------------------
    const getUserId =
      await this.gameSqlQueryRepository.getPlayersUserIdByGameId(
        command.gameId,
      );
    if (!getUserId) {
      notice.addError("not found", "error", ERRORS_CODE.NOT_FOUND);
      return notice;
    }
    if (
      getUserId.player_1UserId !== command.userId &&
      getUserId.player_2UserId !== command.userId
    ) {
      notice.addError("forbidden", "error", ERRORS_CODE.FORBIDDEN);
      return notice;
    }
    if (getUserId.gameStatus !== gameStatuses.finished) {
      notice.addError("game don`t finish", "error", ERRORS_CODE.FORBIDDEN);
      return notice;
    }
    const game = await this.gameSqlQueryRepository.getGameById(command.gameId);
    if (!game) {
      notice.addError("game not found", "error", ERRORS_CODE.NOT_FOUND);
      return notice;
    }

    notice.addData(game);
    return notice;
  }
}
