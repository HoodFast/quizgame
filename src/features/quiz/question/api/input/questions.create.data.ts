import { Trim } from "../../../../../base/validate/trim";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class QuestionsCreateData<A> {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(500)
  body: string;
  correctAnswers: A;
}
