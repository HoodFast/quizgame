import { Module } from '@nestjs/common';
import { QuizController } from './api/quiz.controller';

@Module({
  imports: [],
  controllers: [QuizController],
  providers: [],
  exports: [],
})
export class QuizModule {}
