import { SortData } from "../../../../../base/sortData/sortData.model";

export enum QuestionStatuses {
  all = "all",
  published = "published",
  notPublished = "notPublished",
}

export class QuestionSortData extends SortData {
  bodySearchTerm?: string | null;
  publishedStatus: QuestionStatuses;
}
