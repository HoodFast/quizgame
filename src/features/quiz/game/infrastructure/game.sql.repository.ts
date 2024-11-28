import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { Repository } from "typeorm";
import { Player, playerActive } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { Answer } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";

export class GameSqlRepository {
  constructor(
    @InjectRepository(Game)
    protected gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    protected questionsSqlQueryRepository: QuestionsSqlQueryRepository,
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
      return savedGame.id;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async connectToGame(
    game: Game,
    player_1: Player,
    player_2: Player,
  ): Promise<Game | null> {
    try {
      const questions =
        await this.questionsSqlQueryRepository.getRandomQuestions();
      for (let i = 0; i < questions.length; i++) {
        const gameQuestion = new GameQuestion();
        gameQuestion.gameId = game.id;
        gameQuestion.questionId = questions[i].id;
        gameQuestion.index = i;
        await this.gameQuestionsRepository.save(gameQuestion);
      }
      game.player_2Id = player_2.id;
      game.status = gameStatuses.active;
      game.startGameDate = new Date();

      player_1.active = playerActive.inGame;
      await this.playersRepository.save(player_1);

      player_2.active = playerActive.inGame;
      await this.playersRepository.save(player_2);

      return await this.gamesRepository.save<Game>(game);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
