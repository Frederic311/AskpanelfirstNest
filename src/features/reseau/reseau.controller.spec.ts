import { Test, TestingModule } from '@nestjs/testing';
import { ReseauController } from './reseau.controller';
import { ReseauService } from './reseau.service';

describe('ReseauController', () => {
  let controller: ReseauController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReseauController],
      providers: [ReseauService],
    }).compile();

    controller = module.get<ReseauController>(ReseauController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
