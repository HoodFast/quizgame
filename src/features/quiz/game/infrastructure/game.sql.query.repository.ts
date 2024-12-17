import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { In, Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { GameViewMapper } from "./mappers/game.view.mapper";
import { Question } from "../../question/domain/question.sql.entity";
import { SortData } from "../../../../base/sortData/sortData.model";
import { commentSqlOrmMapper } from "../../../bloggers-platform/comments/infrastructure/mappers/comments.sql.mapper";
import { Pagination } from "../../../../base/paginationInputDto/paginationOutput";

enum ORDER {
  asc = "ASC",
  desc = "DESC",
}
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
    try {
      const currentGame = await this.gamesRepository
        .createQueryBuilder("game")
        .leftJoinAndSelect("game.player_1", "player_1")
        .leftJoinAndSelect("player_1.user", "player_1_user")
        .leftJoinAndSelect("game.player_2", "player_2")
        .leftJoinAndSelect("player_2.user", "player_2_user")
        .leftJoinAndSelect("player_1.answers", "player_1_answers")
        .leftJoinAndSelect("player_2.answers", "player_2_answers")
        .leftJoinAndSelect("game.questions", "questions")
        .leftJoinAndSelect("questions.question", "questions_question")
        .where("game.id = :gameId", { gameId })
        .orderBy("player_1_answers.addedAt", ORDER.asc)
        .addOrderBy("player_2_answers.addedAt", ORDER.asc)
        .getOne();
      if (!currentGame) return null;
      return GameViewMapper(currentGame);
    } catch (e) {
      return null;
    }
  }
  async getDomainGameById(gameId: string): Promise<Game | null> {
    try {
      const currentGame = await this.gamesRepository.findOne({
        relations: [
          "player_1",
          "player_1.user",
          "player_2",
          "player_2.user",
          "player_1.answers",
          "player_2.answers",
          "questions",
        ],
        where: { id: gameId },
      });
      const game = await this.gamesRepository
        .createQueryBuilder("game")
        .leftJoinAndSelect("game.player_1", "player_1")
        .leftJoinAndSelect("player_1.user", "player_1_user")
        .leftJoinAndSelect("game.player_2", "player_2")
        .leftJoinAndSelect("player_2.user", "player_2_user")
        .leftJoinAndSelect("player_1.answers", "player_1_answers")
        .leftJoinAndSelect("player_2.answers", "player_2_answers")
        .leftJoinAndSelect("game.questions", "questions")
        .leftJoinAndSelect("questions.question", "questions_question")
        .where("game.id = :gameId", { gameId })
        .orderBy("questions.index", ORDER.asc)
        .getOne();

      if (!game) return null;
      return game;
    } catch (e) {
      return null;
    }
  }
  async getAllGamesByUserId(
    sortData: SortData,
    userId: string,
  ): Promise<Pagination<GameViewType> | null> {
    const { sortBy, sortDirection, pageSize, pageNumber } = sortData;
    const offset = (pageNumber - 1) * pageSize;
    const res = await this.gamesRepository
      .createQueryBuilder("game")
      .leftJoinAndSelect("game.player_1", "player_1")
      .leftJoinAndSelect("player_1.user", "player_1_user")
      .leftJoinAndSelect("game.player_2", "player_2")
      .leftJoinAndSelect("player_2.user", "player_2_user")
      .leftJoinAndSelect("player_1.answers", "player_1_answers")
      .leftJoinAndSelect("player_2.answers", "player_2_answers")
      .leftJoinAndSelect("game.questions", "questions")
      .leftJoinAndSelect("questions.question", "questions_question")
      .where("player_1.userId = :userId", { userId })
      .orWhere("player_2.userId = :userId", { userId })
      .orderBy(`game.${sortBy}`, sortDirection)
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();
    const pagesCount = Math.ceil(res[1] / pageSize);
    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: res[1],
      items: res[0].map(GameViewMapper),
    };
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
      relations: [
        "player_1",
        "player_1.user",
        "player_2",
        "player_2.user",
        "player_1.answers",
        "player_2.answers",
        "questions",
        "questions.question",
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
