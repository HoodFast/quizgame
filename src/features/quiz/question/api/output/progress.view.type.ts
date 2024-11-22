import { AnswerViewType } from "./answer.view.type";
import { PlayerViewType } from "./player.view.type";

export class ProgressViewType {
  answers: AnswerViewType[] | null;
  player: PlayerViewType;
  score: number;
}
