import { ProgressViewType } from "./progress.view.type";
import { QuestionForGameViewType } from "./question.for.game.view.type";
import { gameStatuses } from "../../../game/domain/game.sql.entity";

export class GameViewType {
  id: string;
  firstPlayerProgress: ProgressViewType;
  secondPlayerProgress: ProgressViewType | null;
  questions: QuestionForGameViewType[] | null;
  status: gameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
