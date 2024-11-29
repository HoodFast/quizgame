import { GameViewType } from "../../../question/api/output/game.view.type";
import { Game } from "../../domain/game.sql.entity";
import { Answer } from "../../domain/answer.sql.entity";
import { Question } from "../../../question/domain/question.sql.entity";

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
      game.player_1Id,
      game.player_1.user.login,
      game.player_1.score,
    ),
    secondPlayerProgress: game.player_2Id
      ? playerMapper(
          answers_2,
          game.player_2Id,
          game.player_2.user.login,
          game.player_2.score,
        )
      : [],
    questions: questions ? questions.map(questionsMapper) : [],
    status: game.status,
    pairCreatedDate: game.pairCreatedDate,
    startGameDate: game.startGameDate,
    finishGameDate: game.finishGameDate,
  };
};

const questionsMapper = (question: Question) => {
  return { id: question.id, body: question.body };
};
const playerMapper = (answers_1, player_1Id, login, score) => {
  return {
    answers: answers_1,
    player: { id: player_1Id, login },
    score,
  };
};
