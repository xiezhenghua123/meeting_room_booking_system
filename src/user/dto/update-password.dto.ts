import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @MinLength(6, { message: '密码长度不能小于6位' })
  password: string;

  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: '邮箱格式不正确',
    },
  )
  email: string;

  @IsNotEmpty()
  captcha: string;
}
