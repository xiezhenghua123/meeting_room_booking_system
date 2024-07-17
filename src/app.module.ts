import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqlConfig } from './config';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [UserModule, TypeOrmModule.forRoot(sqlConfig), RedisModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
