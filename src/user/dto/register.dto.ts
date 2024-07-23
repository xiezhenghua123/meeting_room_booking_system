import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class RegisterUserDto {
  @ApiProperty({
    description: '用户名',
    name: 'username',
    example: 'xxx',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({
    description: '昵称',
    name: 'nickName',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickName: string;

  @ApiProperty({
    description: '密码',
    name: 'password',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能小于6位' })
  password: string;

  @ApiProperty({
    description: '邮箱',
    name: 'email',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '验证码',
    name: 'captcha',
    required: true,
    type: Number,
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
