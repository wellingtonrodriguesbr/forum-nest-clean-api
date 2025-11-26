import { PaginationParams } from "@/core/repositories/pagination-params";
import { Answer } from "../../enterprise/entities/answer";
import { AnswerWithAuthor } from "../../enterprise/entities/value-objects/answer-with-author";

export abstract class AnswersRepository {
  abstract create(answer: Answer): Promise<void>;
  abstract save(answer: Answer): Promise<void>;
  abstract findById(answerId: string): Promise<Answer | null>;
  abstract findManyByQuestionId(
    questionId: string,
    params: PaginationParams
  ): Promise<Answer[]>;
  abstract findManyQuestionAnswersWithAuthor(
    questionId: string,
    params: PaginationParams
  ): Promise<AnswerWithAuthor[]>;
  abstract delete(answer: Answer): Promise<void>;
}
