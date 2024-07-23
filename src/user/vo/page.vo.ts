import { ApiProperty } from '@nestjs/swagger';

export class PageVo<T> {
  @ApiProperty({
    description: '总数',
    name: 'total',
    default: 0,
  })
  total: number;

  @ApiProperty({
    description: '列表',
    name: 'list',
    type: Array<T>,
  })
  list: T[];
}
