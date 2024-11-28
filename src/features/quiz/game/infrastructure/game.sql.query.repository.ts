import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";
import { GameViewMapper } from "./mappers/game.view.mapper";
import { Question } from "../../question/domain/question.sql.entity";

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
      relations: ["player_1"],
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
  async getAllGame() {
    return await this.gamesRepository.find({});
  }
}
