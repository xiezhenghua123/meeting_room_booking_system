import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoginGuard } from './core/guard/login.guard';
import { PermissionGuard } from './core/guard/permission.guard';
import { BossModule } from './boss/boss.module';
import * as path from 'path'; // 使用es6模块引入commonjs模块的方式

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(__dirname, `env/.env.${process.env.NODE_ENV}`),
      ],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            // expiresIn: configService.get('jwt_access_token_expires_in'),
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          autoLoadEntities: true,
          entities: [],
          connectorPackage: 'mysql2',
          logging: true,
          poolSize: 10,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule,
    EmailModule,
    BossModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: LoginGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
