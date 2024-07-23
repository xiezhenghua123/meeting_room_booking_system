import { ApiProperty } from '@nestjs/swagger';

export class UserDetailVo {
  @ApiProperty({
    description: '用户ID',
    name: 'userId',
  })
  userId: number;

  @ApiProperty({
    description: '用户名',
    name: 'username',
  })
  username: string;

  @ApiProperty({
    description: '昵称',
    name: 'nickName',
  })
  nickName: string;

  @ApiProperty({
    description: '邮箱',
    name: 'email',
  })
  email: string;

  @ApiProperty({
    description: '头像',
    name: 'headPic',
  })
  headPic: string;

  @ApiProperty({
    description: '手机号',
    name: 'phoneNumber',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '是否冻结',
    name: 'isFrozen',
  })
  isFrozen: boolean;

  @ApiProperty({
    description: '是否为管理员',
    name: 'isAdmin',
  })
  isAdmin: boolean;
}
