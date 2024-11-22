import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";
import { NotFoundException } from "@nestjs/common";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, InterlayerNotice<boolean>>
{
  constructor(
    private questionsSqlRepository: QuestionsSqlRepository,
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: DeleteQuestionCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();

    const questionExist =
      await this.questionsSqlQueryRepository.getQuestionById(
        command.questionId,
      );
    if (!questionExist) throw new NotFoundException();
    if (questionExist.published) {
      notice.addError("question is published");
      return notice;
    }
    const questionDelete = await this.questionsSqlRepository.deleteQuestion(
      command.questionId,
    );
    if (!questionDelete) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(questionDelete);
    return notice;
  }
}
