import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Question } from "../../domain/question.sql.entity";
import { QuestionsSqlRepository } from "../../infrastructure/questions.sql.repository";
import { QuestionViewType } from "../output/question.view.type";
import { QuestionsSqlQueryRepository } from "../../infrastructure/questions.sql.query.repository";
import { NotFoundException } from "@nestjs/common";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, InterlayerNotice<boolean>>
{
  constructor(
    private questionsSqlRepository: QuestionsSqlRepository,
    private questionsSqlQueryRepository: QuestionsSqlQueryRepository,
  ) {}

  async execute(
    command: UpdateQuestionCommand,
  ): Promise<InterlayerNotice<boolean>> {
    const notice = new InterlayerNotice<boolean>();
    const questionExist =
      await this.questionsSqlQueryRepository.getQuestionById(command.id);
    if (!questionExist) throw new NotFoundException();
    if (questionExist.published) notice.addError("question is published");
    const data = {
      body: command.body,
      correctAnswers: JSON.stringify(command.correctAnswers),
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
