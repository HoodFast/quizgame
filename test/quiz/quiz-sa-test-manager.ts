import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { InputPostCreate } from "../../src/features/bloggers-platform/posts/api/input/PostsCreate.dto";
import { isBoolean } from "class-validator";
import { AnswersStatus } from "../../src/features/quiz/game/domain/answer.sql.entity";
import { gameStatuses } from "../../src/features/quiz/game/domain/game.sql.entity";
import { GameViewType } from "../../src/features/quiz/question/api/output/game.view.type";
import { TestManager } from "../testManager";

export enum winnerPlayers {
  player_1 = "player_1",
  player_2 = "player_2",
  draft = "draft",
}
export class QuizSaTestManager {
  constructor(protected readonly app: INestApplication) {}

  async createNotFinishedGame(player1: string, player2: string) {
    await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player1}`);
    const game = await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player2}`);
    return game.body.id;
  }
  async postCorrectAnswers(player: string, count: number) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player}`)
        .send({ answer: "111" });
    }
    return;
  }
  async postInCorrectAnswers(player: string, count: number) {
    for (let i = 0; i < count; i++) {
      await request(this.app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player}`)
        .send({ answer: "abc" });
    }
    return;
  }
  async createGames(
    player1: string,
    player2: string,
    finish: winnerPlayers = winnerPlayers.draft,
  ) {
    await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player1}`);
    const game = await request(this.app.getHttpServer())
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player2}`);

    let player_1Answer = { answer: "def" };
    let player_2Answer = { answer: "abc" };
    if (finish === winnerPlayers.player_1) {
      player_1Answer = { answer: "111" };
      player_2Answer = { answer: "abc" };
    }
    if (finish === winnerPlayers.player_2) {
      player_2Answer = { answer: "111" };
      player_1Answer = { answer: "abc" };
    }

    for (let i = 0; i < 5; i++) {
      await request(this.app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player1}`)
        .send(player_1Answer);
    }
    for (let i = 0; i < 5; i++) {
      await request(this.app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player2}`)
        .send(player_2Answer);
    }
    const res = await request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game.body.id}`)
      .set("Authorization", `Bearer ${player1}`);
    return res.body;
  }
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
        updatedAt: null,
      });

      await request(this.app.getHttpServer())
        .put(`/sa/quiz/questions/${res.body.id}/publish`)
        .auth("admin", "qwerty")
        .send({ published: true })
        .expect(204);
    }

    return;
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
