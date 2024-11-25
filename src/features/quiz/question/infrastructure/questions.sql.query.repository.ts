import { QuestionSortData } from "../api/input/question.sort.data";
import { Like, Repository } from "typeorm";
import { Question } from "../domain/question.sql.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionViewMapper } from "./mappers/question.view.mapper";
import { QuestionViewType } from "../api/output/question.view.type";
import { Pagination } from "../../../../base/paginationInputDto/paginationOutput";

export class QuestionsSqlQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async getAllQuestions(
    sortData: QuestionSortData,
  ): Promise<Pagination<QuestionViewType> | null> {
    const {
      bodySearchTerm,
      publishedStatus,
      sortDirection,
      sortBy,
      pageSize,
      pageNumber,
    } = sortData;

    const offset = (pageNumber - 1) * pageSize;
    try {
      const searchTerms: any = {
        body: Like(`%${bodySearchTerm}%`),
      };
      if (publishedStatus) {
        if (publishedStatus !== "all") {
          searchTerms.published = publishedStatus === "published";
        }
      }
      const result = await this.questionRepository.findAndCount({
        where: searchTerms,
        order: { [sortBy]: sortDirection },
        skip: offset,
        take: pageSize,
      });

      const pagesCount = Math.ceil(result[1] / pageSize);
      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount: result[1],
        items: result[0].map(QuestionViewMapper),
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getQuestionById(questionId: string): Promise<QuestionViewType | null> {
    const res = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!res) return null;
    return QuestionViewMapper(res);
  }

  async getRandomQuestions() {
    const questions = await this.questionRepository
      .createQueryBuilder("question")
      .orderBy("RANDOM()")
      .limit(5)
      .getMany();
    return questions;
  }
}
