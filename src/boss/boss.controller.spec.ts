import { Test, TestingModule } from '@nestjs/testing';
import { BossController } from './boss.controller';
import { BossService } from './boss.service';

describe('BossController', () => {
  let controller: BossController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BossController],
      providers: [BossService],
    }).compile();

    controller = module.get<BossController>(BossController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
