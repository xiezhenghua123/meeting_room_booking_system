import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BossService } from './boss.service';
import { CreateBossDto } from './dto/create-boss.dto';
import { UpdateBossDto } from './dto/update-boss.dto';

@Controller('boss')
export class BossController {
  constructor(private readonly bossService: BossService) {}

  // @Post()
  // create(@Body() createBossDto: CreateBossDto) {
  //   return this.bossService.create(createBossDto);
  // }

  // @Get()
  // findAll() {
  //   return this.bossService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bossService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBossDto: UpdateBossDto) {
  //   return this.bossService.update(+id, updateBossDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bossService.remove(+id);
  // }

  @Get('get-jobs')
  getJobs() {
    return this.bossService.getJobs();
  }
}
