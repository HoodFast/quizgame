import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Question } from "../../domain/question.sql.entity";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";
import { QuestionViewType } from "../output/question.view.type";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { NotFoundException } from "@nestjs/common";

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements
    ICommandHandler<UpdateQuestionCommand, InterlayerNotice<QuestionViewType>>
{
  constructor(
    private questionsSqlRepository: QuestionsSqlRepository,
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: UpdateQuestionCommand,
  ): Promise<InterlayerNotice<QuestionViewType>> {
    const notice = new InterlayerNotice<QuestionViewType>();
    const questionExist =
      await this.questionsSqlQueryRepository.getQuestionById(command.id);
    if (!questionExist) throw new NotFoundException();
    const question = await this.questionsSqlRepository.updateQuestion(command);
    if (!question) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(question);
    return notice;
  }
}
