import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";
import { Comment as PrismaComment, User as PrismaUser } from "@prisma/client";

type PrismaCommentWithAuthor = PrismaComment & {
  author: PrismaUser;
};

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaCommentWithAuthor): CommentWithAuthor {
    return CommentWithAuthor.create({
      authorId: new UniqueEntityId(raw.authorId),
      commentId: new UniqueEntityId(raw.id),
      authorName: raw.author.name,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
