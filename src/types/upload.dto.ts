import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({
    description: '文件',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
