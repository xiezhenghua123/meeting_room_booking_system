import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/core/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login.dto';
import { LoginUserVo, UserInfo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from '../email/email.service';
import { LoginGuard } from '../core/guard/login.guard';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(EmailService)
  private EmailService: EmailService;

  @Inject(LoginGuard)
  private LoginGuard: LoginGuard;

  async register(user: RegisterUserDto) {
    // redis中拿到验证码
    const captcha = await this.getCaptcha(user.email, 'register');
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }

    if (captcha !== user.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    // 从数据库中查找用户(根据用户名)
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    // 创建用户
    const newUser = this.userRepository.create({
      ...user,
      password: md5(user.password),
    });
    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('注册失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 初始化测试数据
  async initData() {
    // 初始化权限
    const permission1 = this.permissionRepository.create({
      // id: 1,
      code: 'test',
      description: '测试权限1',
    });
    const permission2 = this.permissionRepository.create({
      id: 2,
      code: 'test2',
      description: '测试权限2',
    });
    await this.permissionRepository.save([permission1, permission2]);

    // 初始化角色表
    const adminRole = this.roleRepository.create({
      // id: 1,
      name: 'role_admin',
      permissions: [permission1, permission2],
    });
    const userRole = this.roleRepository.create({
      // id: 2,
      name: 'role_user',
      permissions: [permission1],
    });
    await this.roleRepository.save([adminRole, userRole]);

    // // 初始化管理员
    const adminUser = this.userRepository.create({
      // id: 1,
      username: 'admin',
      password: md5('admin'),
      nickName: '管理员1',
      email: '1803493121@qq.com',
      headPic: '',
      phoneNumber: '123456789',
      isFrozen: false,
      isAdmin: true,
      roles: [adminRole],
    });
    const user = this.userRepository.create({
      // id: 2,
      username: 'user',
      password: md5('user'),
      nickName: '用户1',
      email: '1803493121@qq.com',
      headPic: '',
      phoneNumber: '123456789',
      isFrozen: false,
      roles: [userRole],
    });
    await this.userRepository.save([adminUser, user]);
  }

  transformUser(user: User) {
    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((acc, cur) => {
        cur.permissions.forEach((item) => {
          if (!acc.includes(item)) {
            acc.push(item);
          }
        });
        return acc;
      }, []),
    };
  }

  async login(loginUser: LoginUserDto, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();
    vo.userInfo = this.transformUser(user);
    const { accessToken, refreshToken } = this.generateToken(vo.userInfo);
    vo.accessToken = accessToken;

    vo.refreshToken = refreshToken;
    // 将token存入redis
    await this.redisService.set(
      `token_${vo.userInfo.id}`,
      accessToken,
      this.configService.get('jwt_access_token_expires_in'),
    );

    return vo;
  }
  generateToken(user: UserInfo) {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      permissions: user.permissions,
      username: user.username,
      roles: user.roles,
    });
    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_in'),
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.findUserById(data.userId);
      const { accessToken: access_token, refreshToken: refresh_token } =
        this.generateToken(user);
      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new HttpException(
        'token失效， 请重新登录',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return this.transformUser(user);
  }

  async updatePassword(passwordDto: UpdatePasswordDto) {
    // 拿到验证码
    const captcha = await this.redisService.get(
      `update-password_captcha_${passwordDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== passwordDto.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: passwordDto.username,
    });

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (foundUser.email !== passwordDto.email) {
      throw new HttpException('邮箱错误', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.userRepository.update(
        { id: foundUser.id },
        { password: md5(passwordDto.password) },
      );
      return '密码修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('密码修改失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserInfo(userId: number, user: UpdateUserDto) {
    // 先拿到验证码
    const captcha = await this.getCaptcha(user.email, 'update-user');
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== user.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    user.nickName && (foundUser.nickName = user.nickName);
    user.headPic && (foundUser.headPic = user.headPic);
    user.phoneNumber && (foundUser.phoneNumber = user.phoneNumber);

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      throw new HttpException('修改失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 发送验证码
  async sendCaptcha(email: string, type: string, title?: string) {
    if (!email) {
      throw new HttpException('邮箱不能为空', HttpStatus.BAD_REQUEST);
    }
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`${type}_captcha_${email}`, code, 60 * 5);
    await this.EmailService.sendEmail({
      to: email,
      subject: `${title}验证码`,
      html: `<h1>您的验证码：${code}</h1>`,
    });
    return '验证码已发送';
  }

  // 获取验证码
  async getCaptcha(email: string, type: string) {
    return await this.redisService.get(`${type}_captcha_${email}`);
  }

  async freezeUser(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    user.isFrozen = true;
    await this.userRepository.save(user);
    return '冻结成功';
  }

  async getUserPageList(pageNo: number, pageSize: number, keyword = '') {
    const [list, total] = await this.userRepository.findAndCount({
      where: {
        username: Like(`%${keyword}%`),
      },
      order: {
        createTime: 'DESC',
      },
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'headPic',
        'createTime',
        'isFrozen',
      ],
    });
    return {
      list: list.map((item) => ({
        userId: item.id,
        ...item,
      })),
      total,
    };
  }

  // 退出登录
  async logout(userId: number) {
    return await this.redisService.del(`token_${userId}`);
  }

  checkLogin(authorization: string) {
    return this.LoginGuard.checkLogin(authorization);
  }
}
