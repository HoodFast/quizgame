import { Controller, Get } from "@nestjs/common";
import { GameSqlQueryRepository } from "./features/quiz/game/infrastructure/game.sql.query.repository";

@Controller()
export class AppController {
  constructor() {}

  @Get()
  async hello() {
    return "Hello World!";
  }
}
