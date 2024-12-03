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
  ) {}
  async createNewPlayer(userId: string) {
    const player = new Player();
    player.userId = userId;
    return await this.playersRepository.save<Player>(player);
  }
}
