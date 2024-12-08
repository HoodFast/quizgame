import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { InputPostCreate } from "../../src/features/bloggers-platform/posts/api/input/PostsCreate.dto";
import { isBoolean } from "class-validator";

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

  checkValidateErrors(response: any) {
    const result = response.body;

    expect(result).toEqual({
      errorsMessages: [
        { message: expect.any(String), field: expect.any(String) },
        { message: expect.any(String), field: expect.any(String) },
        { message: expect.any(String), field: expect.any(String) },
      ],
    });
  }
}
