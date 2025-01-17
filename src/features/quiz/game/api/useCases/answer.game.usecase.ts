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
import { Answer, AnswersStatus } from "../../domain/answer.sql.entity";
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

    if (questionsIndex === 4) {
      const myGame = await this.gameSqlQueryRepository.getDomainGameById(
        game.id,
      );
      if (!myGame) return this.isForbidden(notice);

      if (
        myGame.player_1.answers.length < 5 ||
        myGame.player_2.answers.length < 5
      ) {
        setTimeout(async () => {
          if (game.status !== gameStatuses.finished) {
            const timeoutGame =
              await this.gameSqlQueryRepository.getDomainGameById(game.id);
            if (!timeoutGame) return;
            await this.finish(timeoutGame, notice, addAnswer);
          }
        }, 9000);
        notice.addData(AnswerViewMapper(addAnswer));
        return notice;
      }
      const finish = await this.finish(myGame, notice, addAnswer);
      return finish;
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
  countLastPoint(currentGame: Game) {
    const lastQuestionId = currentGame.questions!.slice(-1)[0].questionId;
    const lastAnswerPlayer1 = currentGame.player_1.answers.filter(
      (i) => i.questionId === lastQuestionId,
    )[0];
    const lastAnswerPlayer2 = currentGame.player_2.answers.filter(
      (i) => i.questionId === lastQuestionId,
    )[0];
    if (!lastAnswerPlayer1 && currentGame.player_2.score > 0) {
      currentGame.player_2.score = currentGame.player_2.score + 1;
      return currentGame;
    }
    if (!lastAnswerPlayer2 && currentGame.player_1.score > 0) {
      currentGame.player_1.score = currentGame.player_1.score + 1;
      return currentGame;
    }
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
    return currentGame;
  }
  async finish(
    myGame: Game,
    notice: InterlayerNotice<AnswerViewType>,
    addAnswer: Answer,
  ) {
    const currentGame = await this.countLastPoint(myGame);
    await this.gameSqlRepository.finishGame(currentGame);
    await this.gameSqlRepository.createStatistic(currentGame.player_1.userId);
    await this.gameSqlRepository.createStatistic(currentGame.player_2.userId);
    notice.addData(AnswerViewMapper(addAnswer));
    return notice;
  }
}
