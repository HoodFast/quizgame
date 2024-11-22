import { ProgressViewType } from "./progress.view.type";
import { QuestionForGameViewType } from "./question.for.game.view.type";
import { gameStatuses } from "../../domain/game.sql.entity";

export class GameViewType {
  id: string;
  firstPlayerProgress: ProgressViewType;
  secondPlayerProgress: ProgressViewType;
  questions: QuestionForGameViewType[];
  status: gameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
}
