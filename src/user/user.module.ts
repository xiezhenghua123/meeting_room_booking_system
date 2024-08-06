import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginGuard } from '../core/guard/login.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, LoginGuard],
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
})
export class UserModule {}
