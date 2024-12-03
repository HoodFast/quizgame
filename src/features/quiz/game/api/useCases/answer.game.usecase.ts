import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ERRORS_CODE, InterlayerNotice,} from "../../../../../base/models/Interlayer";
import {GameSqlRepository} from "../../infrastructure/game.sql.repository";
import {PlayerSqlRepository} from "../../infrastructure/player.sql.repository";
import {PlayerSqlQueryRepository} from "../../infrastructure/player.sql.query.repository";
import {playerActive} from "../../domain/player.sql.entity";
import {GameSqlQueryRepository} from "../../infrastructure/game.sql.query.repository";
import {AnswerViewType} from "../../../question/api/output/answer.view.type";
import {AnswerViewMapper} from "../../infrastructure/mappers/answer.view.mapper";
import {AnswersStatus} from "../../domain/answer.sql.entity";

export class AnswerGameCommand {
  constructor(
    public userId: string,
    public body: string,
  ) {}
}

@CommandHandler(AnswerGameCommand)
export class AnswerGameUseCase
  implements
    ICommandHandler<AnswerGameCommand, InterlayerNotice<AnswerViewType>>
{
  constructor(
    private gameSqlRepository: GameSqlRepository,
    private gameSqlQueryRepository: GameSqlQueryRepository,
    private playerSqlRepository: PlayerSqlRepository,
    private playerQuerySqlRepository: PlayerSqlQueryRepository,
  ) {}

  async execute(
    command: AnswerGameCommand,
  ): Promise<InterlayerNotice<AnswerViewType>> {
    const notice = new InterlayerNotice<AnswerViewType>();
    //-----------------------------------------
    const currentPlayer =
      await this.playerQuerySqlRepository.getInGameOrPendingPlayerByUserId(
        command.userId,
      );
    if (
      currentPlayer.length === 0 ||
      currentPlayer[0].active === playerActive.pending
    ) {
      notice.addError(
        "current user is not inside active pair",
        "error",
        ERRORS_CODE.FORBIDDEN,
      );
      return notice;
    }
    const game = await this.gameSqlQueryRepository.getGameByPlayerId(
      currentPlayer[0].id,
    );
    if (!game) {
      notice.addError(
        "current user is not inside active pair",
        "error",
        ERRORS_CODE.FORBIDDEN,
      );
      return notice;
    }
    const questions = await this.gameSqlQueryRepository.getQuestions(
      currentPlayer[0].id,
    );
    if (!questions) {
      notice.addError(
        "current user is not inside active pair",
        "error",
        ERRORS_CODE.FORBIDDEN,
      );
      return notice;
    }
    const currentAnswers = await this.playerQuerySqlRepository.getAnswers(
      currentPlayer[0].id,
    );
    if (currentAnswers.length > 4) {
      notice.addError(
        "already answered to all questions",
        "error",
        ERRORS_CODE.FORBIDDEN,
      );
      return notice;
    }
    const questionsIndex = currentAnswers.length;
    const addAnswer = await this.gameSqlRepository.addAnswer(
      game.id,
      questionsIndex,
      command.body,
      currentPlayer[0].id,
    );
    if (!addAnswer) {
      notice.addError(
        "error adding a answer to the database ",
        "error",
        ERRORS_CODE.ERROR,
      );
      return notice;
    }
    if(addAnswer.answerStatus === AnswersStatus.correct){
      const addOnePoint = []
    }
    notice.addData(AnswerViewMapper(addAnswer)
    return notice;
  }
}
