import { Test, TestingModule } from '@nestjs/testing';
import { AgenceReseauHistoryController } from './agence-reseau-history.controller';

describe('AgenceReseauHistoryController', () => {
  let controller: AgenceReseauHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgenceReseauHistoryController],
    }).compile();

    controller = module.get<AgenceReseauHistoryController>(AgenceReseauHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
