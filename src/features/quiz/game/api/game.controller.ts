import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { IS_UUID, IsUUID } from "class-validator";
import { GetCurrentGameCommand } from "./useCases/get.current.game.usecase";
import { AnswerDto } from "./input/answer.input.dto";
import { AnswerGameCommand } from "./useCases/answer.game.usecase";
import { AnswerViewType } from "../../question/api/output/answer.view.type";

@Controller("pair-game-quiz")
export class GameController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
    private gameRepo: GameSqlRepository,
  ) {}
  @HttpCode(200)
  @UseGuards(AccessTokenAuthGuard)
  @Post("pairs/connection")
  async connection(@UserId() userId: string) {
    const command = new ConnectGameCommand(userId);
    const res = await this.commandBus.execute<
      ConnectGameCommand,
      InterlayerNotice<GameViewType>
    >(command);
    return res.execute();
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get("pairs/my-current")
  async getCurrentGameByUser(@UserId() userId: string) {
    const command = new GetCurrentGameCommand(userId);
    const res = await this.queryBus.execute<
      GetCurrentGameCommand,
      InterlayerNotice<GameViewType>
    >(command);
    return res.execute();
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get("pairs/:id")
  async getGameById(
    @Param("id", new ParseUUIDPipe())
    gameId: string,
    @UserId() userId: string,
  ) {
    const command = new GetGameCommand(gameId, userId);
    const res = await this.queryBus.execute<
      GetGameCommand,
      InterlayerNotice<GameViewType>
    >(command);
    return res.execute();
  }
  @HttpCode(200)
  @UseGuards(AccessTokenAuthGuard)
  @Post("pairs/my-current/answers")
  async myAnswers(@Body() data: AnswerDto, @UserId() userId: string) {
    const command = new AnswerGameCommand(userId, data.answer);
    const res = await this.commandBus.execute<
      AnswerGameCommand,
      InterlayerNotice<AnswerViewType>
    >(command);
    return res.execute();
  }
  @Delete("allgame")
  async deleteGame() {
    return await this.gameRepo.deleteAllGame();
  }
  // @Post("pairs/:id")
  // async finish(@Param("id") id: string) {
  //   await this.gameRepo.finish(id);
  // }
  @Get("allgame")
  async getGames() {
    return await this.gameRepo.getGames();
  }
}
