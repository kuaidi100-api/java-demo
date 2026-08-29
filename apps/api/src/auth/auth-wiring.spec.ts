import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('authentication module wiring', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('initializes the real application graph with the Passport JWT guard', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = module.createNestApplication();
    await app.init();
    expect(app.getHttpAdapter()).toBeDefined();
  });
});
