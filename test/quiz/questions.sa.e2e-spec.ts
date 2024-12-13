import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { appSettings } from "../../src/settings/app.settings";
import { INestApplication } from "@nestjs/common";
import { QuizSaTestManager } from "./quiz-sa-test-manager";
import request from "supertest";
import { QuestionsSqlQueryRepository } from "../../src/features/quiz/question/infrastructure/questions.sql.query.repository";

describe("QuizSaController", () => {
  let app: INestApplication;
  let httpServer;

  let quizSaTestManager;
  let questionsSqlQueryRepository;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    quizSaTestManager = new QuizSaTestManager(app);
    questionsSqlQueryRepository = module.get(QuestionsSqlQueryRepository);
    await quizSaTestManager.createQuestions(201, 1);
  });
  beforeEach(() => {});
  it("should be defined", async () => {
    expect(app).toBeDefined();
  });
  it("getAllQuestions", async () => {
    const allQuestion = await questionsSqlQueryRepository.getAllForTest();
    const pageSize = 3;
    const res = await request(httpServer)
      .get(`/sa/quiz/questions?pageSize=${pageSize}`)
      .auth("admin", "qwerty");
    const pagesCount = Math.ceil(allQuestion.length / pageSize);
    const totalCount = allQuestion.length;
    quizSaTestManager.checkAllQuestsBody(res, pageSize, pagesCount, totalCount);
  });
  it("deleteQuestionsById", async () => {
    const allQuestion = await questionsSqlQueryRepository.getAllForTest();
    await request(httpServer)
      .delete(`/sa/quiz/questions/${allQuestion[0].id}`)
      .auth("admin", "qwerty")
      .expect(204);
    await request(httpServer)
      .get(`/sa/quiz/questions/${allQuestion[0].id}`)
      .expect(404);
  });
  it("update question", async () => {
    const updateDate = {
      body: "updated ok",
      correctAnswers: ["is updated", "is updated"],
    };
    const allQuestion = await questionsSqlQueryRepository.getAllForTest();
    await request(httpServer)
      .put(`/sa/quiz/questions/${allQuestion[0].id}`)
      .auth("admin", "qwerty")
      .set(updateDate)
      .expect(204);
  });
});
