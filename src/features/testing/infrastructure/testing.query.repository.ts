import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GameQuestion } from "../../quiz/game/domain/game.questions.sql.entity";
import { Player } from "../../quiz/game/domain/player.sql.entity";
import { Game } from "../../quiz/game/domain/game.sql.entity";
import { Users } from "../../users/domain/user.sql.entity";
import { Question } from "../../quiz/question/domain/question.sql.entity";
import { Statistic } from "../../quiz/game/domain/statistic.sql.entity";

@Injectable()
export class TestingSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(GameQuestion)
    protected gameQuestionsRepository: Repository<GameQuestion>,
    @InjectRepository(Player) protected playersRepository: Repository<Player>,
    @InjectRepository(Game) protected gamesRepository: Repository<Game>,
    @InjectRepository(Users) protected usersRepository: Repository<Users>,
    @InjectRepository(Statistic)
    protected statisticRepository: Repository<Statistic>,
    @InjectRepository(Question)
    protected questionRepository: Repository<Question>,
  ) {}

  async deleteAll(): Promise<boolean> {
    await this.dataSource.query(`DELETE FROM public."users"`);
    await this.dataSource.query(`DELETE FROM public."blogs"`);
    await this.gameQuestionsRepository.delete({});
    await this.playersRepository.delete({});

    await this.questionRepository.delete({});
    await this.statisticRepository.delete({});
    await this.gamesRepository.delete({});

    return true;
  }
}
