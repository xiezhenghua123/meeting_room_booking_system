import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: configService.get('jwt_access_token_expires_in'),
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
