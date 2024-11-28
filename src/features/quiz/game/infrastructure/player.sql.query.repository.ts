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

  async getInGameOrPendingPlayerByUserId(userId: string): Promise<Player[]> {
    try {
      return await this.playersRepository.find({
        where: {
          userId: userId,
          active: playerActive.pending || playerActive.inGame,
        },
      });
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async getPlayerToUserId(userId: string) {
    return await this.playersRepository.findOne({ where: { userId } });
  }
}
