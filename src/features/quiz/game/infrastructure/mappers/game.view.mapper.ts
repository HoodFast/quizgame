import { GameViewType } from "../../../question/api/output/game.view.type";
import { Game } from "../../domain/game.sql.entity";

export const GameViewMapper = (i: Game): GameViewType => {
  return {
    id: i.id,
    firstPlayerProgress: {
      answers: [""] as any,
      player: { id: "", login: "" },
      score: 0,
    },
    secondPlayerProgress: null,
    questions: [{ id: "", body: "" }],
    status: i.status,
    pairCreatedDate: i.pairCreatedDate,
    startGameDate: i.startGameDate,
    finishGameDate: i.finishGameDate,
  };
};
