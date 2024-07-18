import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/core/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login.dto';
import { LoginUserVo, UserInfo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

  async register(user: RegisterUserDto) {
    // redis中拿到验证码
    const captcha = (await this.redisService.get(
      `captcha_${user.email}`,
    )) as unknown;
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
  // async initData() {
  //  // 初始化角色表

  // }

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

    return vo;
  }
  generateToken(user: UserInfo) {
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_in'),
      },
    );
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
  async refreshToken(refreshToken: string, isAdmin = false) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.findUserById(data.userId, isAdmin);
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

  async findUserById(id: number, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return this.transformUser(user);
  }
}
