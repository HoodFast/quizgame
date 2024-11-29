import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { GameSqlRepository } from "../../infrastructure/game.sql.repository";
import { PlayerSqlRepository } from "../../infrastructure/player.sql.repository";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { PlayerSqlQueryRepository } from "../../infrastructure/player.sql.query.repository";
import { Game } from "../../domain/game.sql.entity";
import { playerActive } from "../../domain/player.sql.entity";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";

export class ConnectGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectGameCommand)
export class ConnectGameUseCase
  implements
    ICommandHandler<ConnectGameCommand, InterlayerNotice<GameViewType>>
{
  constructor(
    private gameSqlRepository: GameSqlRepository,
    private gameSqlQueryRepository: GameSqlQueryRepository,
    private playerSqlRepository: PlayerSqlRepository,
    private playerQuerySqlRepository: PlayerSqlQueryRepository,
  ) {}

  async execute(
    command: ConnectGameCommand,
  ): Promise<InterlayerNotice<GameViewType>> {
    const notice = new InterlayerNotice<GameViewType>();
    //-----------------------------------------
    const pendingGame =
      await this.gameSqlQueryRepository.getGameWithStatusPending();
    const player =
      await this.playerQuerySqlRepository.getInGameOrPendingPlayerByUserId(
        command.userId,
      );

    if (player.length == 0) {
      if (!pendingGame) {
        const newGame = await this.createNewPlayerAndStartPendingGame(
          command.userId,
        );
        if (!newGame) {
          notice.addError("error create new game");
          return notice;
        }
        notice.addData(newGame);
        return notice;
      }
      const connectToGame = await this.createNewPlayerAndConnectToGame(
        pendingGame,
        command.userId,
      );
      if (!connectToGame) {
        notice.addError("error create new game");
        return notice;
      }
      notice.addData(connectToGame);
      return notice;
    }

    if (pendingGame) {
      const game = await this.gameSqlQueryRepository.getGameById(
        pendingGame.id,
      );
      if (!game) {
        notice.addError("");
        return notice;
      }
      notice.addData(game);
      return notice;
    }
    if (player.length > 1) {
      notice.addError("double active players");
      return notice;
    }
    if (player[0].active === playerActive.inGame) {
      notice.addError("player is already in the game");
      return notice;
    }
    if (player[0].active === playerActive.pending) {
      notice.addError("player is pending");
      return notice;
    }

    notice.addError("impossible mistake");
    return notice;
  }

  async createNewPlayerAndStartPendingGame(
    userId: string,
  ): Promise<GameViewType | null> {
    const newGame = await this.gameSqlRepository.createNewGame(userId);

    if (!newGame) return null;
    return await this.gameSqlQueryRepository.getGameById(newGame);
  }
  async createNewPlayerAndConnectToGame(
    game: Game,
    userId: string,
  ): Promise<GameViewType | null> {
    const player_1 = await this.playerQuerySqlRepository.getPlayerToPlayerId(
      game.player_1Id,
    );

    if (!player_1) return null;
    const player_2 = await this.playerSqlRepository.createNewPlayer(userId);

    const connectToGame = await this.gameSqlRepository.connectToGame(
      game,
      player_1,
      player_2,
    );
    if (!connectToGame) return null;
    return await this.gameSqlQueryRepository.getGameById(connectToGame.id);
  }
}
