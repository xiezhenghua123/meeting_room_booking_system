import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  // UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { JwtUserData, RequestWithUser } from 'src/types';
@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject()
  private ConfigService: ConfigService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireLogin) {
      return true;
    }

    const authorization = request.headers['authorization'];
    return this.checkLogin(authorization, request, true);
  }

  async checkLogin(
    authorization: string,
    request?: RequestWithUser,
    isGuard = false,
  ) {
    if (!authorization) {
      return false;
    }

    try {
      const [, token] = authorization.split(' ');
      const user = this.jwtService.verify<JwtUserData>(token);
      const redisToken = await this.redisService.get(`token_${user.userId}`);
      if (!redisToken) {
        if (isGuard) {
          throw new UnauthorizedException('登录已过期，请重新登录');
        }
        return false;
      }
      if (redisToken !== token) {
        if (isGuard) {
          throw new UnauthorizedException('token验证失败');
        }
        return false;
      }

      await this.redisService.set(
        `token_${user.userId}`,
        token,
        this.ConfigService.get('jwt_access_token_expires_in'),
      );

      if (request) {
        request.user = user;
      }
      return true;
    } catch (error) {
      if (isGuard) {
        throw new UnauthorizedException('登录已过期，请重新登录');
      }
      return false;
    }
  }
}
