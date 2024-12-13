import { GameViewType } from "../../../question/api/output/game.view.type";
import { Game } from "../../domain/game.sql.entity";
import { Answer } from "../../domain/answer.sql.entity";
import { Question } from "../../../question/domain/question.sql.entity";
import { AnswerViewMapper } from "./answer.view.mapper";

export const GameViewMapper = (
  game: Game,
  answers_1: Answer[],
  answers_2: Answer[],
  questions: Question[],
): GameViewType => {
  return {
    id: game.id,
    firstPlayerProgress: playerMapper(
      answers_1,
      game.player_1.user.id,
      game.player_1.user.login,
      game.player_1.score,
    ),
    secondPlayerProgress: game.player_2Id
      ? playerMapper(
          answers_2,
          game.player_2.user.id,
          game.player_2.user.login,
          game.player_2.score,
        )
      : null,
    questions: questions.length > 0 ? questions.map(questionsMapper) : null,
    status: game.status,

    pairCreatedDate: game.pairCreatedDate,
    startGameDate: game.startGameDate,
    finishGameDate: game.finishGameDate,
  };
};

const questionsMapper = (question: Question) => {
  return { id: question.id, body: question.body };
};
const playerMapper = (answers_1, userId, login, score) => {
  return {
    answers: answers_1.map(AnswerViewMapper),
    player: { id: userId, login },
    score,
  };
};
