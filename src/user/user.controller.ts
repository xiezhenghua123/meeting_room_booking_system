import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  constructor(private readonly userService: UserService) {}

  // 注册
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  // 获取验证码
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);
    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<h1>您的验证码：${code}</h1>`,
    });
    return '验证码已发送';
  }

  // 登录
  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser);
  }

  // 管理员登录
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, true);
  }

  // 刷新refresh token
  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return await this.userService.refreshToken(refreshToken);
  }

  @Post('admin/refresh')
  async adminRefreshToken(@Body('refresh_token') refreshToken: string) {
    return await this.userService.refreshToken(refreshToken, true);
  }

  // 测试接口
  @Get('test')
  @SetMetadata('require-login', true)
  @SetMetadata('require-permission', ['test'])
  async test() {
    return 'test';
  }
}
