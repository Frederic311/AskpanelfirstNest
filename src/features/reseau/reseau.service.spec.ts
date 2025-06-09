import { Test, TestingModule } from '@nestjs/testing';
import { ReseauService } from './reseau.service';

describe('ReseauService', () => {
  let service: ReseauService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReseauService],
    }).compile();

    service = module.get<ReseauService>(ReseauService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
