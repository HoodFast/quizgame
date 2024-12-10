import { InjectRepository } from "@nestjs/typeorm";
import { Game, gameStatuses } from "../domain/game.sql.entity";
import { Repository } from "typeorm";
import { Player, playerStatus } from "../domain/player.sql.entity";
import { GameQuestion } from "../domain/game.questions.sql.entity";
import { GameViewType } from "../../question/api/output/game.view.type";
import { Answer } from "../domain/answer.sql.entity";
import { QuestionsSqlQueryRepository } from "../../question/infrastructure/questions.sql.query.repository";
import { GameViewMapper } from "./mappers/game.view.mapper";

export class PlayerSqlRepository {
  constructor(
    @InjectRepository(Player)
    protected playersRepository: Repository<Player>,
  ) {}
  async createNewPlayer(userId: string) {
    const player = new Player();
    player.userId = userId;
    return await this.playersRepository.save<Player>(player);
  }
  async makePlayerStatus(id_1: string, id_2, draft: boolean = false) {
    try {
      if (draft) {
        await this.playersRepository.update(id_1, {
          status: playerStatus.draft,
        });
        await this.playersRepository.update(id_2, {
          status: playerStatus.draft,
        });
        return true;
      }
      await this.playersRepository.update(id_1, {
        status: playerStatus.winner,
      });
      await this.playersRepository.update(id_2, { status: playerStatus.lose });
      return true;
    } catch (e) {
      console.log(e);
      throw new Error("playerSqlRepo error");
    }
  }
}
