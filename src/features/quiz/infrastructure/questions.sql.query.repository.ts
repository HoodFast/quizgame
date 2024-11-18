import { QuestionSortData } from "../api/input/question.sort.data";
import { Like, Repository } from "typeorm";
import { Question } from "../domain/question.sql.entity";
import { InjectRepository } from "@nestjs/typeorm";

export class QuestionsSqlQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}
  async getAllQuestions(sortData: QuestionSortData) {
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
      const searchTerms: any = { body: Like(`%${bodySearchTerm}%`) };
      if (publishedStatus !== "all") {
        searchTerms.published = publishedStatus === "published";
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
        items: result[0],
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
