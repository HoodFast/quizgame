import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AccessTokenAuthGuard } from "../../../../guards/access.token.auth.guard";
import { UserId } from "../../../../decorators/userId";
import { ConnectGameCommand } from "./useCases/connect.game.usecase";
import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { GameSqlRepository } from "../infrastructure/game.sql.repository";
import { GetGameCommand } from "./useCases/get.game.usecase";
import { GameViewType } from "../../question/api/output/game.view.type";

@Controller("pair-game-quiz")
export class GameController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
    private gameRepo: GameSqlRepository,
  ) {}

  @UseGuards(AccessTokenAuthGuard)
  @Post("pairs/connection")
  async connection(@UserId() userId: string) {
    const command = new ConnectGameCommand(userId);
    const res = await this.commandBus.execute<
      ConnectGameCommand,
      InterlayerNotice<GameViewType>
    >(command);
    return res.data;
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get("pairs/:id")
  async getGameById(@Param("id") gameId: string, @UserId() userId: string) {
    const command = new GetGameCommand(gameId, userId);
    const res = await this.queryBus.execute<
      GetGameCommand,
      InterlayerNotice<GameViewType>
    >(command);
    res.exception();

    return res.data;
  }
  @Delete("allgame")
  async deleteGame() {
    return await this.gameRepo.deleteAllGame();
  }
  @Post("pairs/:id")
  async finish(@Param("id") id: string) {
    await this.gameRepo.finish(id);
  }
}
