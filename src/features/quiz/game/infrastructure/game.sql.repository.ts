import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";
import { GameViewMapper } from "./mappers/game.view.mapper";

export class GameSqlRepository {
  constructor(
    @InjectRepository(Game)
    protected gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
    protected questionQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async createNewGame(data: any) {
    try {
      const newGame = new Game();
      newGame.player_1 = data.userId;
      newGame.status = gameStatuses.pending;
      newGame.pairCreatedDate = new Date();
      const savedGame = await this.gamesRepository.save<Game>(newGame);
      return savedGame;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getGameById(gameId: string): Promise<GameViewType | null> {
    const currentGame = await this.gamesRepository.findOne({
      where: { id: gameId },
    });
    if (!currentGame) return null;
    if (currentGame.status === gameStatuses.pending) {
      return GameViewMapper(currentGame);
    }
    return null;
  }
}
