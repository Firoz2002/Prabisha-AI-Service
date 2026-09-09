import { Test, TestingModule } from '@nestjs/testing';
import { UsageService } from './usage.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsageService', () => {
  let service: UsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsageService>(UsageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
