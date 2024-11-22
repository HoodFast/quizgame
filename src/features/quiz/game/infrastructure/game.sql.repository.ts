import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "../domain/game.sql.entity";
import { Repository } from "typeorm";

export class GameSqlRepository {
  constructor(
    @InjectRepository(Game)
    protected gameRepository: Repository<Game>,
  ) {}
  async createGame(data: any) {
    try {
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
