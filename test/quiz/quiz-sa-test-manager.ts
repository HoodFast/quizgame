import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { InputPostCreate } from "../../src/features/bloggers-platform/posts/api/input/PostsCreate.dto";
import { isBoolean } from "class-validator";
import { AnswersStatus } from "../../src/features/quiz/game/domain/answer.sql.entity";
import { gameStatuses } from "../../src/features/quiz/game/domain/game.sql.entity";
import { GameViewType } from "../../src/features/quiz/question/api/output/game.view.type";

export class QuizSaTestManager {
  constructor(protected readonly app: INestApplication) {}

  async createQuestions(expectStatus: number, quantity: number = 1) {
    const questionsData = {
      body: "question text",
      correctAnswers: ["111", "222", "333", "444"],
    };
    for (let i = 0; i < quantity; i++) {
      const res = await request(this.app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth("admin", "qwerty")
        .send(questionsData)
        .expect(expectStatus);
      expect(res.body).toEqual({
        id: expect.any(String),
        body: expect.any(String),
        correctAnswers: expect.any(Array),
        published: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    }

    return;
  }

  async updatePost(
    updatePostData: InputPostCreate,
    postId: string,
    expectStatus: number,
  ) {
    const response = await request(this.app.getHttpServer())
      .put(`/posts/${postId}`)
      .auth("admin", "qwerty")
      .send(updatePostData)
      .expect(expectStatus);
    return response;
  }

  async deletePost(id: string) {
    await request(this.app.getHttpServer())
      .delete(`/posts/${id}`)
      .auth("admin", "qwerty")
      .expect(204);
    return;
  }

  checkPostBody(response: any) {
    const post = response.body;
    expect(post).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.any(String),
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: expect.any(String),
          },
        ],
      },
    });
  }

  checkAllQuestsBody(
    response: any,
    pageSize: number,
    pagesCount: number,
    totalCount: number,
  ) {
    const blogs = response.body;
    expect(blogs).toEqual({
      pagesCount,
      page: 1,
      pageSize,
      totalCount,
      items: expect.any(Array),
    });
  }
  checkGameResult(response: any, score1: number, score2: number) {
    const game: GameViewType = response.body;
    expect(game.status).toBe(gameStatuses.finished);
    expect(game.firstPlayerProgress.score).toBe(score1);
    expect(game.secondPlayerProgress!.score).toBe(score2);
    return;
  }
  async checkPendingGameResponse(response: any) {
    const pendingGame = response.body;

    expect(pendingGame).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: gameStatuses.pending,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  }
  async checkGameResponse(response: any) {
    const game = response.body;
    expect(game).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: expect.any(Number),
      },
      secondPlayerProgress: {
        answers: expect.any(Array),
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: expect.any(Number),
      },
      questions: expect.any(Array),
      status: gameStatuses.active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  }
}
