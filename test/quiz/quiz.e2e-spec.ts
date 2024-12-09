import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { appSettings } from "../../src/settings/app.settings";
import { INestApplication } from "@nestjs/common";
import { QuizSaTestManager } from "./quiz-sa-test-manager";
import request from "supertest";
import { TestingSqlQueryRepository } from "../../src/features/testing/infrastructure/testing.query.repository";
import { TestManager } from "../testManager";
import { QuestionsSqlQueryRepository } from "../../src/features/quiz/question/infrastructure/questions.sql.query.repository";

describe("QuizGame", () => {
  let app: INestApplication;
  let httpServer;
  let quizSaTestManager;
  let testingSqlQueryRepository;
  let testManager;
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
    testManager.deleteAll();
    for (let i = 0; i < 3; i++) {
      const accessToken = await testManager.createAccessToken();
      accessTokens.push(accessToken);
    }
    await quizSaTestManager.createQuestions(201, 10);
  });
  beforeEach(() => {});
  it("should be defined", async () => {
    expect(app).toBeDefined();
  });
  it("connection to the game", async () => {
    const user1 = accessTokens[0];
    const user2 = accessTokens[1];
    const pendingGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${user1}`);
    await quizSaTestManager.checkPendingGameResponse(pendingGame);
    const startGame = await request(httpServer)
      .post(`/pair-game-quiz/pairs/connection`)
      .set("Authorization", `Bearer ${user2}`);
    await quizSaTestManager.checkGameResponse(startGame);
  });
});
