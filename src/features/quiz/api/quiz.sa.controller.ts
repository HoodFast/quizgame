import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard } from "../../../guards/auth.guard";
import { QuestionSortData } from "./input/question.sort.data";
import { QuestionsCreateData } from "./input/questions.create.data";
import { GetAllQuestionsCommand } from "./useCases/get.all.questions.query.usecase";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../base/models/Interlayer";
import { Pagination } from "../../../base/paginationInputDto/paginationOutput";
import { Question } from "../domain/question.sql.entity";
import { CreateQuestionCommand } from "./useCases/create.question.usecase";
import { SortDirectionPipe } from "../../../base/pipes/sortDirectionPipe";
import { QuestionViewType } from "./output/question.view.type";
import { UpdateQuestionCommand } from "./useCases/update.question.usecase";

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
  @HttpCode(204)
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
      InterlayerNotice<QuestionViewType>
    >(command);
    if (res.hasError()) throw new BadRequestException();
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
