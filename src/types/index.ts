import type { Request } from 'express';
import { Permission } from 'src/user/entities/permission.entity';

export interface RequestWithUser extends Request {
  user: JwtUserData;
}

export interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}
