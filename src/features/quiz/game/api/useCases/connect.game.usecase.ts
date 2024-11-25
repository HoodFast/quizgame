import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { GameSqlRepository } from "../../infrastructure/game.sql.repository";
import { PlayerSqlRepository } from "../../infrastructure/player.sql.repository";
import { GameViewType } from "../../../question/api/output/game.view.type";
import { PlayerSqlQueryRepository } from "../../infrastructure/player.sql.query.repository";
import { Game } from "../../domain/game.sql.entity";
import { Player } from "../../domain/player.sql.entity";
import { QuestionsSqlQueryRepository } from "../../../question/infrastructure/questions.sql.query.repository";
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
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: ConnectGameCommand,
  ): Promise<InterlayerNotice<GameViewType>> {
    const notice = new InterlayerNotice<GameViewType>();

    const getGame =
      await this.gameSqlQueryRepository.getGameWithStatusPending(); //пытаемя достать игру со статусом пендинг
    if (getGame) {
      //если игра есть
      const getPlayer = //пытаемся достать player без статуса
        await this.playerQuerySqlRepository.getPlayerByUserIdAndNoStatus(
          command.userId,
        );
      if (!getPlayer) {
        //если нет активного (status null) player
        const newPlayer = await this.createNewPlayer(command.userId); //создаем нового
        const game = await this.connectToGame(getGame, newPlayer); //конектим его к игре достаем вопросы и стартуем игру
        if (!game) {
          notice.addError("error connect game");
          return notice;
        }
        notice.addData(game);
        return notice;
      }

      if (
        // если есть player без статуса
        getPlayer.id === getGame.player_1.id || // проверяем является ли он игроком в игре кокторую мы достали
        getPlayer.id === getGame.player_2.id
      ) {
        //если игрок уже в игре то ошибка
        notice.addError("forbidden");
        return notice;
      }
      const game = await this.connectToGame(getGame, getPlayer); //если player без статуса и не находится ни в одной игре подключаем и стартуем игру
      if (!game) {
        notice.addError("error connect game");
        return notice;
      }
      notice.addData(game);
      return notice;
    }
    //если игры со статусом pending нету создаем игру со статусом pending
    const createGameAndGetId = await this.gameSqlRepository.createNewGame(
      command.userId,
    );
    if (!createGameAndGetId) {
      notice.addError("error DAL");
      return notice;
    }
    const game = //достаем игру по id
      await this.gameSqlQueryRepository.getGameById(createGameAndGetId);
    if (!game) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(game);
    return notice;
  }

  async createNewPlayer(userId: string) {
    return await this.playerSqlRepository.createNewPlayer(userId);
  }
  async connectToGame(
    game: Game,
    player: Player,
  ): Promise<GameViewType | null> {
    const connectToGame = await this.gameSqlRepository.connectToGame(
      game,
      player.id,
    );
    if (!connectToGame) return null;
    return await this.gameSqlQueryRepository.getGameById(connectToGame.id);
  }
}
