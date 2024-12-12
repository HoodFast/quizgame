import { Trim } from "../../../../../base/validate/trim";
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class QuestionsPublishedData {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
