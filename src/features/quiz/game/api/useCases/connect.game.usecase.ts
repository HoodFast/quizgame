import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InterlayerNotice } from "../../../../../base/models/Interlayer";
import { QuestionViewType } from "../../../question/api/output/question.view.type";
import { QuestionsSqlRepository } from "../../../question/infrastructure/questions.sql.repository";

export class ConnectGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectGameCommand)
export class ConnectGameUseCase
  implements
    ICommandHandler<ConnectGameCommand, InterlayerNotice<QuestionViewType>>
{
  constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

  async execute(
    command: ConnectGameCommand,
  ): Promise<InterlayerNotice<QuestionViewType>> {
    const notice = new InterlayerNotice<QuestionViewType>();

    const created: any = [];
    if (!created) {
      notice.addError("error DAL");
      return notice;
    }

    notice.addData(created);
    return notice;
  }
}
