import request from "supertest";

import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { AnswerFactory } from "test/factories/make-answer";

describe("Fetch question answers (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [QuestionFactory, StudentFactory, AnswerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /questions/:questionId/answers", async () => {
    const user = await studentFactory.makePrismaStudent({ name: "John Doe" });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionId = question.id;

    await Promise.all([
      answerFactory.makePrismaAnswer({
        content: "New answer created 1",
        questionId,
        authorId: user.id,
      }),
      answerFactory.makePrismaAnswer({
        content: "New answer created 2",
        questionId,
        authorId: user.id,
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({
          content: "New answer created 1",
          authorName: "John Doe",
        }),
        expect.objectContaining({
          content: "New answer created 2",
          authorName: "John Doe",
        }),
      ]),
    });
  });
});
