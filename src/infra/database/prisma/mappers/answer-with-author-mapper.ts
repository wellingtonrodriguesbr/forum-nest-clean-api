import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { AnswerWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/answer-with-author";
import {
  Answer as PrismaAnswer,
  User as PrismaUser,
  Attachment as PrismaAttachament,
} from "@prisma/client";

type PrismaAnswerWithAuthor = PrismaAnswer & {
  author: PrismaUser;
  attachments: PrismaAttachament[];
};

export class PrismaAnswerWithAuthorMapper {
  static toDomain(raw: PrismaAnswerWithAuthor): AnswerWithAuthor {
    let attachments: AnswerAttachment[] = [];

    if (raw.attachments.length > 0) {
      attachments = raw.attachments.map((attachment) => {
        return AnswerAttachment.create(
          {
            answerId: new UniqueEntityId(attachment.answerId!),
            attachmentId: new UniqueEntityId(attachment.id),
          },
          new UniqueEntityId(attachment.id)
        );
      });
    }

    return AnswerWithAuthor.create({
      answerId: new UniqueEntityId(raw.id),
      questionId: new UniqueEntityId(raw.questionId),
      authorId: new UniqueEntityId(raw.authorId),
      authorName: raw.author.name,
      content: raw.content,
      attachments,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
