import { AnswerWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/answer-with-author";

export class AnswerWithAuthorPresenter {
  static toHTTP(answerWithAuthor: AnswerWithAuthor) {
    return {
      answerId: answerWithAuthor.answerId.toString(),
      questionId: answerWithAuthor.questionId.toString(),
      authorId: answerWithAuthor.authorId.toString(),
      authorName: answerWithAuthor.authorName,
      content: answerWithAuthor.content,
      createdAt: answerWithAuthor.createdAt,
      updatedAt: answerWithAuthor.updatedAt,
    };
  }
}
