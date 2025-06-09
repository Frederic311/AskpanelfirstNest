import { Test, TestingModule } from '@nestjs/testing';
import { AgenceReseauHistoryService } from './agence-reseau-history.service';

describe('AgenceReseauHistoryService', () => {
  let service: AgenceReseauHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgenceReseauHistoryService],
    }).compile();

    service = module.get<AgenceReseauHistoryService>(AgenceReseauHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
