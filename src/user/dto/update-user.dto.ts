import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '邮箱', example: 'xxx@xxx.com', required: true })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '头像', example: '' })
  headPic: string;

  @ApiProperty({ description: '昵称', example: '昵称' })
  nickName: string;

  @ApiProperty({ description: '手机号', example: '12345678910' })
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phoneNumber: string;

  @ApiProperty({ description: '验证码', example: '465235', required: true })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
