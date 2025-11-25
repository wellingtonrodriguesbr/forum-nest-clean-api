import { DomainEvents } from "@/core/events/domain-events";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { Question } from "@/domain/forum/enterprise/entities/question";
import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details";
import { InMemoryStudentsRepository } from "./in-memory-students-repository";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { InMemoryQuestionAttachmentsRepository } from "./in-memory-question-attachments-repository";

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: Question[] = [];

  constructor(
    private studentsRepository: InMemoryStudentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
  ) {}

  async create(question: Question) {
    this.items.push(question);

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems()
    );

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async save(question: Question) {
    const questionIndex = this.items.findIndex((q) => q.id === question.id);
    this.items[questionIndex] = question;

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems()
    );

    await this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems()
    );

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async findBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);

    if (!question) {
      return null;
    }

    return question;
  }

  async findDetailsBySlug(slug: string): Promise<QuestionDetails | null> {
    const question = this.items.find((item) => item.slug.value === slug);

    if (!question) {
      return null;
    }

    const author = this.studentsRepository.items.find((student) => {
      return student.id.equals(question.authorId);
    });

    if (!author) {
      throw new Error(`Author with id: ${question.authorId} not found`);
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (item) => item.questionId.equals(question.id)
    );

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentsRepository.items.find((attachment) => {
        return attachment.id.equals(questionAttachment.attachmentId);
      });

      if (!attachment) {
        throw new Error(
          `Attachment with id: ${questionAttachment.attachmentId.toString()} not found`
        );
      }

      return attachment;
    });

    const questionDetails = QuestionDetails.create({
      questionId: question.id,
      authorId: author.id,
      authorName: author.name,
      title: question.title,
      slug: question.slug,
      content: question.content,
      attachments,
      bestAnswerId: question.bestAnswerId ?? undefined,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    });

    return questionDetails;
  }

  async findManyRecent({ page }: PaginationParams) {
    const questions = this.items
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice((page - 1) * 20, page * 20);

    return questions;
  }

  async findById(questionId: string) {
    const question = this.items.find(
      (item) => item.id.toString() === questionId
    );

    if (!question) {
      return null;
    }

    return question;
  }

  async delete(question: Question) {
    const questionIndex = this.items.findIndex((q) => q.id === question.id);
    this.items.splice(questionIndex, 1);

    await this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString()
    );
  }
}
