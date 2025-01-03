import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ERRORS_CODE,
  InterlayerNotice,
} from "../../../../../base/models/Interlayer";
import { GameSqlRepository } from "../../infrastructure/game.sql.repository";
import { PlayerSqlRepository } from "../../infrastructure/player.sql.repository";
import { PlayerSqlQueryRepository } from "../../infrastructure/player.sql.query.repository";
import { Player, playerActive } from "../../domain/player.sql.entity";
import { GameSqlQueryRepository } from "../../infrastructure/game.sql.query.repository";
import { AnswerViewType } from "../../../question/api/output/answer.view.type";
import { AnswerViewMapper } from "../../infrastructure/mappers/answer.view.mapper";
import { AnswersStatus } from "../../domain/answer.sql.entity";
import { Game, gameStatuses } from "../../domain/game.sql.entity";

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
    const currentPlayer =
      await this.playerQuerySqlRepository.getInGameOrPendingPlayerByUserId(
        command.userId,
      );
    if (!currentPlayer || currentPlayer.active === playerActive.pending) {
      return this.isForbidden(notice, "user is not inside active pair");
    }
    const game =
      await this.gameSqlQueryRepository.getDomainActiveGameByPlayerId(
        currentPlayer.id,
      );

    if (!game) {
      return this.isForbidden(notice, "not found active game");
    }
    if (game.status === gameStatuses.finished) {
      notice.addError("game is finished", "error", ERRORS_CODE.FORBIDDEN);
    }
    const currentAnswers = await this.playerQuerySqlRepository.getAnswers(
      currentPlayer.id,
    );
    const questionsIndex = currentAnswers.length;

    if (questionsIndex > 4) {
      return this.isForbidden(notice, "already answered to all questions");
    }
    if (!game.questions) return this.isForbidden(notice, "not questions");
    const question = game.questions.filter((i) => i.index === questionsIndex);

    const addAnswer = await this.gameSqlRepository.addAnswer(
      game.id,
      question[0],
      command.body,
      currentPlayer.id,
    );

    if (!addAnswer) {
      notice.addError(
        "error adding answer to the database ",
        "error",
        ERRORS_CODE.ERROR,
      );
      return notice;
    }
    if (addAnswer.answerStatus === AnswersStatus.correct) {
      // if (game.player_1Id === currentPlayer.id) {
      //   game.player_1.score = game.player_1.score + 1;
      // }
      // if (game.player_2Id === currentPlayer.id) {
      //   game.player_2.score = game.player_2.score + 1;
      // }
      await this.gameSqlRepository.addPoint(addAnswer.playerId, 1);
    }

    // await this.gameSqlRepository.gameSave(game);
    if (questionsIndex === 4) {
      const currentGame = await this.gameSqlQueryRepository.getDomainGameById(
        game.id,
      );
      if (!currentGame) return this.isForbidden(notice);
      // const currentGame = game;

      if (
        currentGame.player_1.answers.length < 5 ||
        currentGame.player_2.answers.length < 5
      ) {
        notice.addData(AnswerViewMapper(addAnswer));
        return notice;
      }

      const lastQuestionId = currentGame.questions!.slice(-1)[0].questionId;
      const lastAnswerPlayer1 = currentGame.player_1.answers.filter(
        (i) => i.questionId === lastQuestionId,
      )[0];
      const lastAnswerPlayer2 = currentGame.player_2.answers.filter(
        (i) => i.questionId === lastQuestionId,
      )[0];

      if (
        lastAnswerPlayer2.addedAt < lastAnswerPlayer1.addedAt &&
        currentGame.player_2.score > 0
      ) {
        currentGame.player_2.score = currentGame.player_2.score + 1;
      }
      if (
        lastAnswerPlayer2.addedAt > lastAnswerPlayer1.addedAt &&
        currentGame.player_1.score > 0
      ) {
        currentGame.player_1.score = currentGame.player_1.score + 1;
      }

      await this.gameSqlRepository.finishGame(currentGame);
      await this.gameSqlRepository.createStatistic(currentGame.player_1.userId);
      await this.gameSqlRepository.createStatistic(currentGame.player_2.userId);

      notice.addData(AnswerViewMapper(addAnswer));
      return notice;
    }

    notice.addData(AnswerViewMapper(addAnswer));
    return notice;
  }
  isForbidden(
    notice: InterlayerNotice<AnswerViewType>,
    message: string = "some error",
  ) {
    notice.addError(`${message}`, "error", ERRORS_CODE.FORBIDDEN);
    return notice;
  }
}
