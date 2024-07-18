import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permission } from 'src/user/entities/permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) return true;

    const permissions = this.reflector.getAllAndOverride<string[]>(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );

    if (!permissions) return true;

    const hasPermission = permissions.some(
      (permission) =>
        !request.user.permissions.find(
          (item: Permission) => item.code === permission,
        ),
    );

    if (!hasPermission)
      throw new UnauthorizedException('您没有访问该接口的权限');
    return true;
  }
}
