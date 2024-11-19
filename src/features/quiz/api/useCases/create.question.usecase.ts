import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";
import { QuestionViewType } from "../output/question.view.type";

export class CreateQuestionCommand {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements
    ICommandHandler<CreateQuestionCommand, InterlayerNotice<QuestionViewType>>
{
  constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

  async execute(
    command: CreateQuestionCommand,
  ): Promise<InterlayerNotice<QuestionViewType>> {
    const notice = new InterlayerNotice<QuestionViewType>();

    const created = await this.questionsSqlRepository.createQuestion({
      body: command.body,
      correctAnswers: JSON.stringify(command.correctAnswers),
    });
    if (!created) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(created);
    return notice;
  }
}
