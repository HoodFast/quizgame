import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Player, playerActive } from "../domain/player.sql.entity";
import { Answer } from "../domain/answer.sql.entity";

export class PlayerSqlQueryRepository {
  constructor(
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
  ) {}

  async getInGameOrPendingPlayerByUserId(
    userId: string,
  ): Promise<Player | null> {
    try {
      return await this.playersRepository.findOne({
        where: [
          {
            userId: userId,
            active: playerActive.pending,
          },
          {
            userId: userId,
            active: playerActive.inGame,
          },
        ],
      });
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async getPlayerToPlayerId(id: string) {
    return await this.playersRepository.findOne({ where: { id } });
  }
  async getAnswers(playerId: string) {
    return await this.answersRepository.find({ where: { playerId: playerId } });
  }

  async getAnswersByQuestionId(playerId: string, questionId: string) {
    return await this.answersRepository.findOne({
      where: { playerId: playerId, questionId: questionId },
    });
  }
}
