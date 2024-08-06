import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { UserDetailVo } from './vo/user-detail.vo';
import { RequireLogin, UserInfo } from 'src/core/decorator/custom.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageDto } from './dto/page.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh_token.vo';
import { PageVo } from './vo/page.vo';
import {
  ApiPagerResult,
  ApiResult,
} from 'src/core/decorator/api-result.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import storage from 'src/core/file-storage';
import { UploadDto } from 'src/types/upload.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  JwtService: JwtService;

  @ApiBody({ type: RegisterUserDto })
  @ApiResult(String, '注册')
  // 注册
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiParam({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
  })
  @ApiResult(String, '获取验证码')
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    return await this.userService.sendCaptcha(address, 'register', '注册');
  }

  // 登录
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResult(LoginUserVo, '普通用户登录')
  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser);
  }

  // 管理员登录
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResult(LoginUserVo, '管理员登录')
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, true);
  }

  // 刷新refresh token
  @ApiParam({
    description: '刷新TOken',
    type: String,
    required: true,
    name: 'refresh_token',
  })
  @ApiResult(RefreshTokenVo, '刷新token')
  @Get(['admin/refresh', 'refresh'])
  @RequireLogin()
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    return await this.userService.refreshToken(refreshToken);
  }

  // 获取用户信息
  @ApiBearerAuth()
  @ApiResult(UserDetailVo, '获取用户信息')
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const data = await this.userService.findUserById(userId);
    const userDetail = new UserDetailVo();
    userDetail.userId = data.id;
    userDetail.username = data.username;
    userDetail.nickName = data.nickName;
    userDetail.email = data.email;
    userDetail.headPic = data.headPic;
    userDetail.phoneNumber = data.phoneNumber;
    userDetail.isFrozen = data.isFrozen;
    userDetail.isAdmin = data.isAdmin;
    return userDetail;
  }

  // 修改用户密码
  @ApiBody({
    description: '用户修改密码',
    type: UpdatePasswordDto,
    required: true,
  })
  @ApiResult(String, '修改密码')
  @Post(['admin/password', 'password'])
  async changePassword(@Body() passwordDto: UpdatePasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  // 用户修改密码验证码
  @ApiParam({
    description: '邮箱',
    type: String,
    required: true,
    name: 'email',
  })
  @ApiResult(String, '用户修改密码验证码')
  @Get('password-captcha')
  @RequireLogin()
  async passwordCaptcha(@Query('email') email: string) {
    return await this.userService.sendCaptcha(
      email,
      'update-password',
      '修改密码',
    );
  }

  // 修改用户信息
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResult(String, '修改用户信息')
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async updateUserInfo(
    @UserInfo('userId') userId: number,
    @Body() user: UpdateUserDto,
  ) {
    return await this.userService.updateUserInfo(userId, user);
  }

  // 修改用户信息验证码
  @ApiParam({
    description: '邮箱',
    type: String,
    required: true,
    name: 'email',
  })
  @ApiResult(String, '修改用户信息验证码')
  @Get('update-captcha')
  @RequireLogin()
  async updateCaptcha(@Query('email') email: string) {
    return await this.userService.sendCaptcha(
      email,
      'update-user',
      '修改用户信息',
    );
  }

  // 冻结用户
  @ApiParam({
    description: '用户ID',
    type: Number,
    required: true,
    name: 'userId',
  })
  @ApiResult(String, '冻结用户')
  @Get('freeze')
  async freezeUser(@Query('userId') userId: number) {
    return await this.userService.freezeUser(userId);
  }

  // 获取用户列表(可搜索用户名)
  @ApiBody({
    type: PageDto,
  })
  @ApiPagerResult(UserDetailVo)
  @Post('list')
  async userPageList(
    @Body('pageNo', new DefaultValuePipe(1)) pageNo: PageDto['pageNo'],
    @Body('pageSize', new DefaultValuePipe(10)) pageSize: PageDto['pageSize'],
    @Body('keyword', new DefaultValuePipe('')) keyword: PageDto['keyword'],
  ): Promise<PageVo<UserDetailVo>> {
    return await this.userService.getUserPageList(pageNo, pageSize, keyword);
  }

  // 图片上传
  @ApiBody({
    description: '图片上传',
    type: UploadDto,
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiResult(String, '图片上传')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage('uploads'),
      limits: {
        fileSize: 1024 * 1024 * 3, //
      },
      fileFilter: (req, file, cb) => {
        const name = extname(file.originalname);
        const allowExt = ['.jpg', '.jpeg', '.png', '.gif'];
        if (allowExt.includes(name)) {
          cb(null, true);
        } else {
          {
            cb(new BadRequestException('只支持图片'), false);
          }
        }
      },
    }),
  )
  @Post('upload')
  @RequireLogin()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file.destination + file.filename;
  }

  // 检查是否登录过期
  @ApiResult(Boolean, '检查登录')
  @Get('check-login')
  async checkLogin(@Headers('authorization') authorization: string) {
    return await this.userService.checkLogin(authorization);
  }

  // 退出登录
  @ApiResult(String, '退出登录')
  @Get('logout')
  async logout(@UserInfo('userId') userId: number) {
    return this.userService.logout(userId);
  }

  // 测试接口
  @Get('test')
  async test() {
    return 'test';
  }

  @Get('init-data')
  async initData() {
    return await this.userService.initData();
  }
}
