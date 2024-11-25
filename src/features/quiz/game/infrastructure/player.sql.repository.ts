import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { Repository } from "typeorm";
import { Player } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";
import { GameViewMapper } from "./mappers/game.view.mapper";

export class PlayerSqlRepository {
  constructor(
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
    @InjectRepository(Answer)
    protected answersRepository: Repository<Answer>,
  ) {}

  async getPlayerById(userId: string): Promise<Player | null> {
    try {
      const player = await this.playersRepository.findOne({
        relations: ["answers"],
        where: { userId },
      });
      return player;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async checkPlayer(userId: string): Promise<boolean> {
    try {
      const player = await this.playersRepository.find({
        where: { userId },
      });
      if (player.length === 0) return true;
      player.forEach((i) => {
        if (!i.status) return false;
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
