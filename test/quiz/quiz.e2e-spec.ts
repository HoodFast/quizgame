import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { appSettings } from "../../src/settings/app.settings";
import { INestApplication } from "@nestjs/common";
import { QuizSaTestManager } from "./quiz-sa-test-manager";
import request from "supertest";
import { TestingSqlQueryRepository } from "../../src/features/testing/infrastructure/testing.query.repository";
import { TestManager } from "../testManager";

describe("QuizGame", () => {
  let app: INestApplication;
  let httpServer;
  let quizSaTestManager;
  let testingSqlQueryRepository;
  let testManager;
  let firstGameId;
  let secondGameId;
  let accessTokens: any = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    quizSaTestManager = new QuizSaTestManager(app);
    testingSqlQueryRepository = module.get(TestingSqlQueryRepository);
    testManager = new TestManager(app);
    for (let i = 0; i < 4; i++) {
      const accessToken = await testManager.createAccessToken();
      accessTokens.push(accessToken);
    }

    await quizSaTestManager.createQuestions(201, 10);
  });
  beforeEach(() => {});
  afterAll(() => {
    testManager.deleteAll();
  });
  it("should be defined", async () => {
    expect(app).toBeDefined();
  });
  it("connection to the game", async () => {
    const player1 = accessTokens[0];
    const player2 = accessTokens[1];
    const pendingGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player1}`);
    await quizSaTestManager.checkPendingGameResponse(pendingGame);
    const startGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player2}`);
    firstGameId = startGame.body.id;
    await quizSaTestManager.checkGameResponse(startGame);
  });
  it("connection to the second game", async () => {
    const player1 = accessTokens[2];
    const player2 = accessTokens[3];
    const pendingGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player1}`);
    await quizSaTestManager.checkPendingGameResponse(pendingGame);
    const startGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player2}`);
    await quizSaTestManager.checkGameResponse(startGame);
    secondGameId = startGame.body.id;
  });
  it("finish first game user1 win", async () => {
    const player1 = accessTokens[0];
    const player2 = accessTokens[1];
    const correctAnswer = { answer: "111" };
    const incorrectAnswer = { answer: "abc" };
    for (let i = 0; i < 4; i++) {
      await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player1}`)
        .send(correctAnswer);
    }
    await request(httpServer)
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set("Authorization", `Bearer ${player2}`)
      .send(correctAnswer);
    for (let i = 0; i < 4; i++) {
      const res = await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player2}`)
        .send(incorrectAnswer);
    }
    await request(httpServer)
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set("Authorization", `Bearer ${player1}`)
      .send(correctAnswer);
    const finishedFirstGame = await request(httpServer)
      .get(`/pair-game-quiz/pairs/${firstGameId}`)
      .set("Authorization", `Bearer ${player1}`);

    quizSaTestManager.checkGameResult(finishedFirstGame, 5, 2);
  });

  it("finish second game draft", async () => {
    const player1 = accessTokens[2];
    const player2 = accessTokens[3];
    const correctAnswer = { answer: "111" };
    const incorrectAnswer = { answer: "abc" };
    for (let i = 0; i < 4; i++) {
      await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player1}`)
        .send(correctAnswer);
    }
    await request(httpServer)
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set("Authorization", `Bearer ${player1}`)
      .send(incorrectAnswer);
    for (let i = 0; i < 5; i++) {
      await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player2}`)
        .send(correctAnswer);
    }
    const finishedFirstGame = await request(httpServer)
      .get(`/pair-game-quiz/pairs/${secondGameId}`)
      .set("Authorization", `Bearer ${player1}`);

    quizSaTestManager.checkGameResult(finishedFirstGame, 5, 5);
  });
  it.skip("finish game timeout", async () => {
    const player1 = accessTokens[2];
    const player2 = accessTokens[3];
    const correctAnswer = { answer: "111" };
    const incorrectAnswer = { answer: "abc" };
    const startGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player1}`);
    const connectionGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${player2}`);

    for (let i = 0; i < 3; i++) {
      await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player1}`)
        .send(correctAnswer);
    }
    for (let i = 0; i < 5; i++) {
      await request(httpServer)
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set("Authorization", `Bearer ${player2}`)
        .send(correctAnswer);
    }
    // setTimeout(async () => {
    //   const finishedFirstGame = await request(httpServer)
    //     .get(`/pair-game-quiz/pairs/${secondGameId}`)
    //     .set("Authorization", `Bearer ${player1}`);
    //
    //   quizSaTestManager.checkGameResult(finishedFirstGame, 3, 6);
    // }, 11000);
    const asyncFunction = async () => {
      return new Promise<any>((resolve) =>
        setTimeout(async () => {
          resolve(
            await request(httpServer)
              .get(`/pair-game-quiz/pairs/${startGame.body.id}`)
              .set("Authorization", `Bearer ${player1}`),
          );
        }, 11000),
      );
    };

    const res = await asyncFunction();
    quizSaTestManager.checkGameResult(res, 3, 6);
  });
});
