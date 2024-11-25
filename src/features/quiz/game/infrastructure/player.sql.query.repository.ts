import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { Answer } from "../domain/answer.sql.entity";
export class PlayerSqlQueryRepository {
  constructor(
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
  ) {}

  async getPlayerByUserIdAndNoStatus(userId: string): Promise<Player | null> {
    try {
      const players = await this.playersRepository.find({
        where: { userId: userId, status: IsNull() },
      });
      return players[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
