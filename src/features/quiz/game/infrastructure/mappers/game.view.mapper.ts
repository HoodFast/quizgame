import { GameViewType } from "../../../question/api/output/game.view.type";
import { Game } from "../../domain/game.sql.entity";
import { Answer } from "../../domain/answer.sql.entity";
import { Question } from "../../../question/domain/question.sql.entity";
import { AnswerAllViewMapper, AnswerViewMapper } from "./answer.view.mapper";

export const GameViewMapper = (
  game: Game,
  answerMap: boolean = true,
): GameViewType => {
  const answers_1 = game.player_1
    ? game.player_1.answers.sort(
        (a, b) => a.addedAt.getTime() - b.addedAt.getTime(),
      )
    : null;
  const answers_2 = game.player_2
    ? game.player_2.answers.sort(
        (a, b) => a.addedAt.getTime() - b.addedAt.getTime(),
      )
    : null;
  const questions = game.questions
    ? game.questions.sort((a, b) => a.index - b.index).map((i) => i.question)
    : [];

  return {
    id: game.id,
    firstPlayerProgress: playerMapper(
      answers_1,
      game.player_1.user.id,
      game.player_1.user.login,
      game.player_1.score,
      answerMap,
    ),
    secondPlayerProgress: game.player_2Id
      ? playerMapper(
          answers_2,
          game.player_2.user.id,
          game.player_2.user.login,
          game.player_2.score,
          answerMap,
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
const playerMapper = (answers, userId, login, score, answerMap: boolean) => {
  const answerMapper = answerMap ? AnswerViewMapper : AnswerAllViewMapper;
  return {
    answers: answers.map(answerMapper),
    player: { id: userId, login },
    score,
  };
};
