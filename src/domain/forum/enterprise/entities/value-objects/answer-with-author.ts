import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";
import { AnswerAttachment } from "../answer-attachment";

export interface AnswerWithAuthorProps {
  answerId: UniqueEntityId;
  questionId: UniqueEntityId;
  authorId: UniqueEntityId;
  authorName: string;
  content: string;
  attachments: AnswerAttachment[];
  createdAt: Date;
  updatedAt?: Date | null;
}

export class AnswerWithAuthor extends ValueObject<AnswerWithAuthorProps> {
  get answerId() {
    return this.props.answerId;
  }

  get questionId() {
    return this.props.questionId;
  }

  get authorId() {
    return this.props.authorId;
  }

  get authorName() {
    return this.props.authorName;
  }

  get content() {
    return this.props.content;
  }

  get attachments() {
    return this.props.attachments;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: AnswerWithAuthorProps) {
    return new AnswerWithAuthor(props);
  }
}
