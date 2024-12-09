import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GameQuestion } from "../../quiz/game/domain/game.questions.sql.entity";
import { Player } from "../../quiz/game/domain/player.sql.entity";
import { Game } from "../../quiz/game/domain/game.sql.entity";

@Injectable()
export class TestingSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(Player) protected playersRepository: Repository<Player>,
    @InjectRepository(Game) protected gamesRepository: Repository<Game>,
  ) {}

  async deleteAll(): Promise<boolean> {
    await this.dataSource.query(`DELETE FROM public."users"`);
    await this.dataSource.query(`DELETE FROM public."blogs"`);

    await this.gameQuestionsRepository.delete({});
    await this.playersRepository.delete({});
    await this.gamesRepository.delete({});
    return true;
  }
}
