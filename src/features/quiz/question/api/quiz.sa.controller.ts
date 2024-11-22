import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";

import { QuestionSortData } from "./input/question.sort.data";
import { QuestionsCreateData } from "./input/questions.create.data";
import { GetAllQuestionsCommand } from "./useCases/get.all.questions.query.usecase";
import { CommandBus, ICommandHandler, QueryBus } from "@nestjs/cqrs";

import { Question } from "../domain/question.sql.entity";
import { CreateQuestionCommand } from "./useCases/create.question.usecase";

import { QuestionViewType } from "./output/question.view.type";
import { UpdateQuestionCommand } from "./useCases/update.question.usecase";
import { PublishQuestionCommand } from "./useCases/published.question.usecase";
import { DeleteQuestionCommand } from "./useCases/delete.question.usecase";
import { SortDirectionPipe } from "../../../../base/pipes/sortDirectionPipe";
import { AuthGuard } from "../../../../guards/auth.guard";
import { Pagination } from "../../../../base/paginationInputDto/paginationOutput";
import { InterlayerNotice } from "../../../../base/models/Interlayer";

@UseGuards(AuthGuard)
@Controller("sa/quiz/questions")
export class QuizSaController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}
  @UsePipes(SortDirectionPipe)
  @Get()
  async GetAllQuestions(
    @Query() data: QuestionSortData,
  ): Promise<Pagination<QuestionViewType> | null> {
    const command = new GetAllQuestionsCommand(data);
    const result = await this.queryBus.execute<
      GetAllQuestionsCommand,
      InterlayerNotice<Pagination<QuestionViewType>>
    >(command);
    if (result.hasError()) throw new BadRequestException();
    return result.data;
  }

  @Post()
  async CreateQuestion(@Body() data: QuestionsCreateData<string[]>) {
    const command = new CreateQuestionCommand(data.body, data.correctAnswers);
    const res = await this.commandBus.execute<
      CreateQuestionCommand,
      InterlayerNotice<Question>
    >(command);
    if (res.hasError()) throw new BadRequestException();
    return res.data;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":id")
  async UpdateQuestion(
    @Param("id") id: string,
    @Body() data: QuestionsCreateData<string[]>,
  ) {
    const command = new UpdateQuestionCommand(
      id,
      data.body,
      data.correctAnswers,
    );
    debugger;
    const res = await this.commandBus.execute<
      UpdateQuestionCommand,
      InterlayerNotice<boolean>
    >(command);
    if (res.hasError()) throw new BadRequestException();
    return;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":id/publish")
  async PublishQuestion(
    @Param("id") id: string,
    @Body() data: { published: boolean },
  ) {
    const command = new PublishQuestionCommand(id, data.published);
    const res = await this.commandBus.execute<
      PublishQuestionCommand,
      InterlayerNotice<boolean>
    >(command);
    if (res.hasError()) throw new BadRequestException();
    return res.data;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async DeleteQuestion(@Param("id") id: string) {
    const command = new DeleteQuestionCommand(id);
    const res = await this.commandBus.execute<
      DeleteQuestionCommand,
      InterlayerNotice<boolean>
    >(command);
    if (res.hasError()) throw new BadRequestException();
    return res.data;
  }
}
