import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { NotFoundException } from "@nestjs/common";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

export class PublishQuestionCommand {
  constructor(
    public id: string,
    public published: boolean,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand, InterlayerNotice<boolean>>
{
  constructor(
    private questionsSqlRepository: QuestionsSqlRepository,
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: PublishQuestionCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    const questionExist =
      await this.questionsSqlQueryRepository.getQuestionById(command.id);
    if (!questionExist) throw new NotFoundException();
    const data = {
      published: command.published,
      updatedAt: new Date(),
    };
    const question = await this.questionsSqlRepository.updateQuestion(
      command.id,
      { ...data },
    );
    if (!question) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(question);
    return notice;
  }
}
