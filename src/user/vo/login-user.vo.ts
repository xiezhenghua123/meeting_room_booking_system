import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';

export class UserInfo {
  @ApiProperty({ description: '用户ID', example: 1 })
  id: number;

  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string;

  @ApiProperty({ description: '昵称', example: '管理员' })
  nickName: string;

  @ApiProperty({ description: '邮箱', example: '' })
  email: string;

  @ApiProperty({ description: '头像', example: '' })
  headPic: string;

  @ApiProperty({ description: '手机号', example: '' })
  phoneNumber: string;

  @ApiProperty({ description: '是否冻结', example: false })
  isFrozen: boolean;

  @ApiProperty({ description: '是否为管理员', example: false })
  isAdmin: boolean;

  @ApiProperty({ description: '创建时间', example: new Date() })
  createTime: Date;

  @ApiProperty({ description: '角色', example: ['role_admin'] })
  roles: string[];

  @ApiProperty({ description: '权限', example: ['test1', 'test2'] })
  permissions: Permission[];
}

export class LoginUserVo {
  @ApiProperty({ description: '用户信息' })
  userInfo: UserInfo;

  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;
}
