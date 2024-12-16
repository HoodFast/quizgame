import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { appSettings } from "../../src/settings/app.settings";
import { INestApplication } from "@nestjs/common";
import { TestingSqlQueryRepository } from "../../src/features/testing/infrastructure/testing.query.repository";
import { TestManager } from "../testManager";
import { QuizSaTestManager, winnerPlayers } from "../quiz/quiz-sa-test-manager";

describe("create users and questions and game statistics", () => {
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
    await testManager.deleteAll();
    for (let i = 0; i < 2; i++) {
      const accessToken = await testManager.createAccessToken();
      accessTokens.push(accessToken);
    }
    // console.log(accessTokens);
    await quizSaTestManager.createQuestions(201, 6);
  });
  beforeEach(() => {});
  afterAll(() => {});
  it("should be defined", async () => {
    expect(app).toBeDefined();
  });
  it("create statistics games", async () => {
    const player1 = await testManager.createAccessToken();
    const player2 = await testManager.createAccessToken();
    for (let i = 0; i < 5; i++) {
      await quizSaTestManager.createGames(
        player1,
        player2,
        winnerPlayers.player_2,
      );
    }
    for (let i = 0; i < 5; i++) {
      await quizSaTestManager.createGames(
        player1,
        player2,
        winnerPlayers.player_1,
      );
    }
    for (let i = 0; i < 5; i++) {
      await quizSaTestManager.createGames(player1, player2);
    }
    console.log(`player_1:   ${player1},
    player_2:   ${player2}`);
  });
  it.skip("should be defined", async () => {
    testManager.deleteAll();
  });
});
