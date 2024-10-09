import { PartialType } from '@nestjs/swagger';
import { CreateBossDto } from './create-boss.dto';

export class UpdateBossDto extends PartialType(CreateBossDto) {}
