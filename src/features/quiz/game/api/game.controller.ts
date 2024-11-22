import { Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AccessTokenAuthGuard } from "../../../../guards/access.token.auth.guard";
import { UserId } from "../../../../decorators/userId";

@Controller("pair-game-quiz")
export class GameController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(AccessTokenAuthGuard)
  @Post("pairs/connection")
  async Connection(@UserId() userId: string) {}
}
