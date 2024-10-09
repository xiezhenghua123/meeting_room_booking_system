import { Module } from '@nestjs/common';
import { BossService } from './boss.service';
import { BossController } from './boss.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/boss.entity';

@Module({
  controllers: [BossController],
  providers: [BossService],
  imports: [TypeOrmModule.forFeature([Job])],
})
export class BossModule {}
