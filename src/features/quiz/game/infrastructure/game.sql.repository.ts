import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { DataSource, Repository } from "typeorm";
import { Player, playerActive } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { Answer, AnswersStatus } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";
import { GameSqlQueryRepository } from "./game.sql.query.repository";

export class GameSqlRepository {
  constructor(
    @InjectRepository(Game)
    protected gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectDataSource()
    protected dataSource: DataSource,
    protected questionsSqlQueryRepository: QuestionsSqlQueryRepository,
    protected gamesSqlQueryRepository: GameSqlQueryRepository,
  ) {}

  async createNewGame(userId: string) {
    try {
      const newPlayer = new Player();
      newPlayer.userId = userId;
      const savedPlayer = await this.playersRepository.save<Player>(newPlayer);
      const newGame = new Game();

      newGame.player_1Id = savedPlayer.id;
      newGame.status = gameStatuses.pending;
      newGame.pairCreatedDate = new Date();
      const savedGame = await this.gamesRepository.save<Game>(newGame);
      // savedPlayer.gameId = savedGame.id;
      await this.playersRepository.save(savedPlayer);
      return savedGame.id;
    } catch (e) {
      console.log(`errors create new game: ${e}`);
      return null;
    }
  }

  async saveMultipleGameQuestions(entity: GameQuestion[]) {
    const res = await this.gameQuestionsRepository
      .createQueryBuilder("gameQuestions")
      .insert()
      .into(GameQuestion)
      .values(entity)
      .execute();

    return res;
  }
  async connectToGame(
    game: Game,
    player_1: Player,
    player_2: Player,
  ): Promise<Game | null> {
    try {
      const questions =
        await this.questionsSqlQueryRepository.getRandomQuestions();
      const entities: GameQuestion[] = [];
      for (let i = 0; i < questions.length; i++) {
        const gameQuestion = new GameQuestion();
        gameQuestion.game = game;
        gameQuestion.question = questions[i];
        gameQuestion.index = i;
        entities.push(gameQuestion);
        // await this.gameQuestionsRepository.save(gameQuestion);
      }
      await this.saveMultipleGameQuestions(entities);
      game.player_2Id = player_2.id;
      game.status = gameStatuses.active;
      game.startGameDate = new Date();

      player_1.active = playerActive.inGame;
      await this.playersRepository.save(player_1);

      // player_2.gameId = game.id;
      player_2.active = playerActive.inGame;
      await this.playersRepository.save(player_2);

      return await this.gamesRepository.save<Game>(game);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async deleteAllGame() {
    const deleteGameQuestions = await this.gameQuestionsRepository.delete({});
    const deletedPlayer = await this.playersRepository.delete({});
    const deletedGame = await this.gamesRepository.delete({});
    return await this.gamesRepository.find({});
  }
  async finish(id: string) {
    const game = await this.gamesRepository.update(id, {
      status: gameStatuses.finished,
    });
    return;
  }
  async addAnswer(
    gameId: string,
    questionIndex: number,
    body: string,
    playerId: string,
  ): Promise<Answer | null> {
    try {
      const question = await this.gameQuestionsRepository.findOne({
        where: { gameId: gameId, index: questionIndex },
      });
      if (!question) return null;
      const player = await this.playersRepository.findOne({
        where: { id: playerId },
      });
      if (!player) return null;

      const currentQuestion =
        await this.questionsSqlQueryRepository.getQuestionById(
          question?.questionId,
        );
      if (!currentQuestion) return null;
      const answer = new Answer();
      answer.addedAt = new Date();
      answer.body = body;
      answer.playerId = playerId;
      answer.questionId = currentQuestion.id;

      if (currentQuestion.correctAnswers.includes(body)) {
        answer.answerStatus = AnswersStatus.correct;
      } else {
        answer.answerStatus = AnswersStatus.incorrect;
      }
      const saved = await this.answersRepository.save(answer);
      return saved;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async addPoint(playerId: string, point: number) {
    try {
      const player = await this.playersRepository.findOne({
        where: { id: playerId },
      });
      if (!player) return null;
      player.score = player.score + point;
      return await this.playersRepository.save(player);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async finishGame(game: Game, player_1: Player, player_2: Player) {
    try {
      const res = await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          player_1.active = playerActive.finished;
          player_2.active = playerActive.finished;
          game.status = gameStatuses.finished;
          game.finishGameDate = new Date();
          await transactionalEntityManager.save(player_1);
          await transactionalEntityManager.save(player_2);
          await transactionalEntityManager.save(game);
        },
      );
      const players = await this.playersRepository.find({});
      const games = await this.gamesRepository.find({});
      const view = await this.gamesSqlQueryRepository.getGameById(game.id);
      debugger;
      return;
      // await this.playersRepository.update(player_1Id, {
      //   active: playerActive.finished,
      // });
      // await this.playersRepository.update(player_2Id, {
      //   active: playerActive.finished,
      // });
      // return await this.gamesRepository.update(gameId, {
      //   status: gameStatuses.finished,
      //   finishGameDate: new Date(),
      // });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getGames() {
    // const games = await this.gamesRepository.find({});

    return await this.gamesSqlQueryRepository.getAllGames();
  }
}
