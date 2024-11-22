import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

@Controller("quiz")
export class QuizController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}
}
