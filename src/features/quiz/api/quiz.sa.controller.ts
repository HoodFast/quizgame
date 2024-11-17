import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('sa/quiz/questions')
export class QuizSaController {
  @Get()
  async GetAllQuestions() {
    return;
  }

  @Post()
  async CreateQuestion() {
    return;
  }

  @Put()
  async UpdateQuestion() {
    return;
  }

  @Put()
  async PublishQuestion() {
    return;
  }

  @Delete()
  async DeleteQuestion() {
    return;
  }
}
