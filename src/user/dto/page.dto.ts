import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PageDto {
  @ApiProperty({ description: '当前页', example: 1 })
  @IsInt({ message: '当前页必须为整数' })
  @Min(1, { message: '当前页最小为1' })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  pageNo: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsInt({ message: '每页数量必须为整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @ApiProperty({ description: '关键字', example: '关键字' })
  keyword: string;
}
