import { InterlayerNotice } from "../../../../base/models/Interlayer";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Question } from "../../domain/question.sql.entity";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";

export class CreateQuestionCommand {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, InterlayerNotice<Question>>
{
  constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

  async execute(
    command: CreateQuestionCommand,
  ): Promise<InterlayerNotice<Question>> {
    const notice = new InterlayerNotice<Question>();

    const created: any = await this.questionsSqlRepository.createQuestion({
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
