import { DomainEvents } from "@/core/events/domain-events";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";
import { Answer } from "@/domain/forum/enterprise/entities/answer";
import { AnswerWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/answer-with-author";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";
import { InMemoryAnswerAttachmentsRepository } from "./in-memory-answer-attachments-repository";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";

export class InMemoryAnswersRepository implements AnswersRepository {
  public items: Answer[] = [];

  constructor(
    private answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository
  ) {}

  async create(answer: Answer) {
    this.items.push(answer);

    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getItems()
    );

    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async save(answer: Answer) {
    const answerIndex = this.items.findIndex((item) => item.id === answer.id);
    this.items[answerIndex] = answer;

    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getNewItems()
    );
    await this.answerAttachmentsRepository.deleteMany(
      answer.attachments.getRemovedItems()
    );

    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async findById(answerId: string) {
    const answer = this.items.find((item) => item.id.toString() === answerId);

    if (!answer) {
      return null;
    }

    return answer;
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20);

    return answers;
  }

  async findManyQuestionAnswersWithAuthor(
    questionId: string,
    params: PaginationParams
  ): Promise<AnswerWithAuthor[]> {
    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .map((answer) => {
        const author = this.studentsRepository.items.find(
          (student) => student.id === answer.authorId
        );

        if (!author) {
          throw new Error(`Author with id: ${answer.authorId} not found`);
        }

        const answerAttachments = this.answerAttachmentsRepository.items.filter(
          (item) => item.answerId.equals(answer.id)
        );

        const attachments = answerAttachments.map((answerAttachment) => {
          const attachment = this.answerAttachmentsRepository.items.find(
            (attachment) => {
              return attachment.id.equals(answerAttachment.attachmentId);
            }
          );

          if (!attachment) {
            throw new Error(
              `Attachment with id: ${answerAttachment.attachmentId.toString()} not found`
            );
          }
          return attachment;
        });

        const questionAnswersWithAuthor = AnswerWithAuthor.create({
          answerId: answer.id,
          questionId: answer.questionId,
          authorId: answer.authorId,
          authorName: author.name,
          content: answer.content,
          attachments,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
        });

        return questionAnswersWithAuthor;
      })
      .slice((params.page - 1) * 20, params.page * 20);

    return answers;
  }

  async delete(answer: Answer) {
    const answerIndex = this.items.findIndex((q) => q.id === answer.id);
    this.items.splice(answerIndex, 1);

    await this.answerAttachmentsRepository.deleteManyByAnswerId(
      answer.id.toString()
    );
  }
}
