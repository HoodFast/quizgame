import { GameViewType } from "../../../question/api/output/game.view.type";
import { Game } from "../../domain/game.sql.entity";
import { Answer } from "../../domain/answer.sql.entity";
import { Question } from "../../../question/domain/question.sql.entity";
import { AnswerViewMapper } from "./answer.view.mapper";

export const GameViewMapper = (game: Game): GameViewType => {
  const answers_1 = game.player_1
    ? game.player_1.answers.sort(
        (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
      )
    : null;
  const answers_2 = game.player_2
    ? game.player_1.answers.sort(
        (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
      )
    : null;
  const questions = game.questions
    ? game.questions.sort((a, b) => b.index - a.index).map((i) => i.question)
    : [];

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
const playerMapper = (answers, userId, login, score) => {
  return {
    answers: answers.map(AnswerViewMapper),
    player: { id: userId, login },
    score,
  };
};
