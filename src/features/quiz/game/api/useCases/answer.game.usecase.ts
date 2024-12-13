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
    const secondPlayerId =
      game.player_1Id === currentPlayer.id ? game.player_2Id : game.player_1Id;
    const currentAnswers = await this.playerQuerySqlRepository.getAnswers(
      currentPlayer.id,
    );
    const questionsIndex = currentAnswers.length;

    if (questionsIndex > 4) {
      return this.isForbidden(notice, "already answered to all questions");
    }

    const addAnswer = await this.gameSqlRepository.addAnswer(
      game.id,
      questionsIndex,
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
      await this.gameSqlRepository.addPoint(addAnswer.playerId, 1);
    }
    // if (questionsIndex === 4) {
    //   const player = await this.playerQuerySqlRepository.getPlayerToPlayerId(
    //     currentPlayer.id,
    //   );
    //   const secondPlayer =
    //     await this.playerQuerySqlRepository.getPlayerToPlayerId(secondPlayerId);
    //   if (!player) return this.isForbidden(notice);
    //   if (!secondPlayer) return this.isForbidden(notice);
    //   const secondPlayerLastAnswers =
    //     await this.playerQuerySqlRepository.getAnswersByQuestionId(
    //       secondPlayerId,
    //       addAnswer.questionId,
    //     );
    //   if (secondPlayerLastAnswers && game.status !== gameStatuses.finished) {
    //     if (
    //       addAnswer.addedAt < secondPlayerLastAnswers.addedAt &&
    //       player.score > 0
    //     ) {
    //       const addPoints = await this.gameSqlRepository.addPoint(
    //         addAnswer.playerId,
    //         1,
    //       );
    //       // await this.finishGame(player.id, secondPlayerId, game.id);
    //     } else {
    //       if (
    //         (secondPlayerLastAnswers.addedAt > addAnswer.addedAt,
    //         secondPlayer.score > 0)
    //       ) {
    //         const addPoints = await this.gameSqlRepository.addPoint(
    //           secondPlayer.id,
    //           1,
    //         );
    //         await this.finishGame(player.id, secondPlayerId, game);
    //       }
    //     }
    //   }
    // }
    if (questionsIndex === 4) {
      const secondPlayerLastAnswers =
        await this.playerQuerySqlRepository.getAnswersByQuestionId(
          secondPlayerId,
          addAnswer.questionId,
        );
      if (!secondPlayerLastAnswers) {
        notice.addData(AnswerViewMapper(addAnswer));
        return notice;
      }
      let player = await this.playerQuerySqlRepository.getPlayerToPlayerId(
        currentPlayer.id,
      );
      let secondPlayer =
        await this.playerQuerySqlRepository.getPlayerToPlayerId(secondPlayerId);
      if (!player) return this.isForbidden(notice);
      if (!secondPlayer) return this.isForbidden(notice);
      if (
        secondPlayerLastAnswers.addedAt < addAnswer.addedAt &&
        secondPlayer.score > 0
      ) {
        secondPlayer = await this.gameSqlRepository.addPoint(
          secondPlayer.id,
          1,
        );
      }
      if (
        secondPlayerLastAnswers.addedAt > addAnswer.addedAt &&
        player.score > 0
      ) {
        player = await this.gameSqlRepository.addPoint(player.id, 1);
      }

      await this.finishGame(player!, secondPlayer!, game);
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
  async finishGame(player1: Player, player2: Player, game: Game) {
    // const player_1 =
    //   await this.playerQuerySqlRepository.getPlayerToPlayerId(player_1Id);
    // if (!player_1) return;
    // const player_2 =
    //   await this.playerQuerySqlRepository.getPlayerToPlayerId(player2_Id);
    // if (!player_2) return;
    await this.gameSqlRepository.finishGame(game, player1, player2);
    if (player1.score === player2.score) {
      await this.playerSqlRepository.makePlayerStatus(
        player1.id,
        player2.id,
        true,
      );
      return;
    }
    if (player1.score > player2.score) {
      await this.playerSqlRepository.makePlayerStatus(player1.id, player2.id);
    } else {
      await this.playerSqlRepository.makePlayerStatus(player2.id, player1.id);
    }
    return;
  }
}
