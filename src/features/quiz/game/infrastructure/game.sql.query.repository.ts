import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { In, Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { GameViewMapper } from "./mappers/game.view.mapper";
import { Question } from "../../question/domain/question.sql.entity";

type getGameAndUserIdOutput = {
  player_1UserId: string;
  player_2UserId: string | null;
  gameStatus: gameStatuses;
};
export class GameSqlQueryRepository {
  constructor(
    @InjectRepository(Game)
    protected gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(Question)
    protected questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
  ) {}

  async getGameById(gameId: string): Promise<GameViewType | null> {
    const currentGame = await this.gamesRepository.findOne({
      relations: ["player_1", "player_1.user", "player_2", "player_2.user"],
      where: { id: gameId },
    });
    if (!currentGame) return null;
    const answers_1 = await this.answersRepository.find({
      where: { playerId: currentGame.player_1Id },
    });
    const answers_2 = await this.answersRepository.find({
      where: { playerId: currentGame.player_2Id },
    });
    const currentQuestion = await this.gameQuestionsRepository.find({
      where: { gameId },
      order: { index: "DESC" },
    });
    let questions: Question[] = [];
    for (let i = 0; i < currentQuestion.length; i++) {
      const question = await this.questionsRepository.findOne({
        where: { id: currentQuestion[i].questionId },
      });
      if (question) {
        questions.push(question);
      }
    }
    if (!currentGame) return null;
    return GameViewMapper(currentGame, answers_1, answers_2, questions);
  }
  async getAllGames(): Promise<GameViewType | null> {
    const currentGames = await this.gamesRepository.find({
      relations: ["player_1", "player_1.user", "player_2", "player_2.user"],
    });
    const res: any = [];
    for (let i = 0; i < currentGames.length; i++) {
      const currentGame = currentGames[i];
      const gameId = currentGames[i].id;
      const answers_1 = await this.answersRepository.find({
        where: { playerId: currentGame.player_1Id },
      });
      const answers_2 = await this.answersRepository.find({
        where: { playerId: currentGame.player_2Id },
      });
      const currentQuestion = await this.gameQuestionsRepository.find({
        where: { gameId },
        order: { index: "DESC" },
      });
      let questions: Question[] = [];
      for (let i = 0; i < currentQuestion.length; i++) {
        const question = await this.questionsRepository.findOne({
          where: { id: currentQuestion[i].questionId },
        });
        if (question) {
          questions.push(question);
        }
      }
      if (!currentGame) return null;
      debugger;
      res.push(GameViewMapper(currentGame, answers_1, answers_2, questions));
    }
    return res;
  }
  async getGameWithStatusPending(): Promise<Game | null> {
    try {
      return await this.gamesRepository.findOne({
        where: { status: gameStatuses.pending },
      });
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async getPlayersUserIdByGameId(
    gameId: string,
  ): Promise<getGameAndUserIdOutput | null> {
    try {
      const getGameWithUsers = await this.gamesRepository.findOne({
        relations: ["player_1", "player_2"],
        where: { id: gameId },
      });
      if (!getGameWithUsers) return null;

      return {
        player_1UserId: getGameWithUsers!.player_1.userId,
        player_2UserId: getGameWithUsers!.player_2
          ? getGameWithUsers!.player_2.userId
          : null,
        gameStatus: getGameWithUsers!.status,
      };
    } catch (e) {
      return null;
    }
  }
  async getGameByPlayerId(playerId: string) {
    const game = await this.gamesRepository.findOne({
      where: [
        {
          player_1Id: playerId,
          status: In([gameStatuses.active, gameStatuses.pending]),
        },
        {
          player_2Id: playerId,
          status: In([gameStatuses.active, gameStatuses.pending]),
        },
      ],
    });
    if (!game) return null;
    return await this.getGameById(game.id);
  }
  async getDomainActiveGameByPlayerId(playerId: string): Promise<Game | null> {
    return await this.gamesRepository.findOne({
      where: [
        { player_1Id: playerId, status: gameStatuses.active },
        { player_2Id: playerId, status: gameStatuses.active },
      ],
    });
  }

  async getAllGame() {
    return await this.gamesRepository.find({});
  }

  async getQuestions(playerId: string): Promise<GameQuestion[] | null> {
    const game = await this.gamesRepository.findOne({
      where: [
        { player_1Id: playerId },
        { player_2Id: playerId },
        { status: gameStatuses.active },
      ],
    });
    if (!game) return null;
    return game.questions;
  }
}
