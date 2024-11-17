import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../../../guards/auth.guard";
import { QuestionSortData } from "./input/question.sort.data";
import { QuestionsCreateData } from "./input/questions.create.data";
import { GetAllQuestionsCommand } from "./useCases/get.all.questions.query.usecase";
import { QueryBus } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../base/models/Interlayer";
import { Pagination } from "../../../base/paginationInputDto/paginationOutput";
import { Question } from "../damain/question.sql.entity";

@UseGuards(AuthGuard)
@Controller("sa/quiz/questions")
export class QuizSaController {
  constructor(private queryBus: QueryBus) {}
  @Get()
  async GetAllQuestions(@Query() data: QuestionSortData) {
    const command = new GetAllQuestionsCommand(data);
    const result = await this.queryBus.execute<
      GetAllQuestionsCommand,
      InterlayerNotice<Pagination<Question>>
    >(command);
    if (result.hasError()) throw new BadRequestException();
    return result.data;
  }

  @Post()
  async CreateQuestion(@Body() data: QuestionsCreateData) {
    return;
  }

  @Put()
  async UpdateQuestion() {
    return;
  }

  @Put()
  async PublishQuestion() {
    return;
  }

  @Delete()
  async DeleteQuestion() {
    return;
  }
}
