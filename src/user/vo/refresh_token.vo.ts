import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenVo {
  @ApiProperty({
    description: '刷新令牌',
    name: 'refresh_token',
    type: String,
  })
  refresh_token: string;

  @ApiProperty({
    description: '访问令牌',
    name: 'access_token',
    type: String,
  })
  access_token: string;
}
