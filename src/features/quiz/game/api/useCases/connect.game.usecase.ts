import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { GameSqlRepository } from "../../infrastructure/game.sql.repository";
import { PlayerSqlRepository } from "../../infrastructure/player.sql.repository";
import { GameViewType } from "../../../question/api/output/game.view.type";

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
    private playerSqlRepository: PlayerSqlRepository,
  ) {}

  async execute(
    command: ConnectGameCommand,
  ): Promise<InterlayerNotice<GameViewType>> {
    const notice = new InterlayerNotice<GameViewType>();
    const player = await this.playerSqlRepository.checkPlayer(command.userId);
    if (!player) {
      notice.addError("player already in game or pending");
      return notice;
    }
    const getGame = await this.gameSqlRepository.getGameWithStatusPending();
    if (getGame) {
      const getQuestions = [];
      const connectGame = [];
    }

    const createGame = await this.gameSqlRepository.createNewGame(
      command.userId,
    );
    if (!createGame) {
      notice.addError("error DAL");
      return notice;
    }
    const game = await this.gameSqlRepository.getGameById(createGame);
    if (!game) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(game);
    return notice;
  }
}
