import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ default: 200 })
  code: number;
  @ApiProperty()
  message: string;
  @ApiProperty()
  data: T;
}
