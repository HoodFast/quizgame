import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
  ERRORS_CODE,
  InterlayerNotice,
} from "../../../../../base/models/Interlayer";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { gameStatuses } from "../../domain/game.sql.entity";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";
import { PlayerSqlQueryRepository } from "../../infrastructure/player.sql.query.repository";

export class GetCurrentGameCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetCurrentGameCommand)
export class GetCurrentGameUseCase
  implements
    IQueryHandler<GetCurrentGameCommand, InterlayerNotice<GameViewType>>
{
  constructor(
    private gameSqlQueryRepository: GameSqlQueryRepository,
    private playerSqlQueryRepository: PlayerSqlQueryRepository,
  ) {}

  async execute(
    command: GetCurrentGameCommand,
  ): Promise<InterlayerNotice<GameViewType>> {
    const notice = new InterlayerNotice<GameViewType>();
    //-----------------------------------------
    const getActivePlayer =
      await this.playerSqlQueryRepository.getInGameOrPendingPlayerByUserId(
        command.userId,
      );
    if (!getActivePlayer) {
      notice.addError("not found", "error", ERRORS_CODE.NOT_FOUND);
      return notice;
    }
    const game = await this.gameSqlQueryRepository.getGameByPlayerId(
      getActivePlayer.id,
    );
    if (!game) {
      notice.addError("not found", "error", ERRORS_CODE.NOT_FOUND);
      return notice;
    }

    notice.addData(game);
    return notice;
    0;
  }
}
